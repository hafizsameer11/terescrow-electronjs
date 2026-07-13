import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth, isAgentRole, isReadOnlyDemoMode } from '@renderer/context/authContext';
import {
  dailyReportCheckIn,
  dailyReportCheckOut,
  getDailyReportLogs,
  getDailyReportReport,
  type ShiftType,
} from '@renderer/api/admin/dailyReport';
import ReportDetailsModal from '@renderer/components/modal/ReportDetailsModal';
import { mapDailyReportDetail } from '@renderer/utils/mapDailyReportDetail';
import { todayIsoDate } from '@renderer/utils/formatWorkTimer';
import { toastApiError, toastSuccess } from '@renderer/utils/toast';

export type DailyReportSession = {
  logId: number;
  checkInTime: string;
  shift: ShiftType;
};

type DailyReportSessionContextValue = {
  session: DailyReportSession | null;
  isClockedIn: boolean;
  /** Agents must clock in before using the app. */
  requiresClockIn: boolean;
  sessionLoading: boolean;
  canUseApp: boolean;
  checkIn: (shift: ShiftType) => void;
  checkOut: () => void;
  isCheckingIn: boolean;
  isCheckingOut: boolean;
  /** Post-checkout report modal — gate should not block this. */
  isReportModalOpen: boolean;
};

const STORAGE_KEY = 'terescrow-daily-report-session';

const DailyReportSessionContext = createContext<DailyReportSessionContextValue | null>(null);

function readStoredSession(userId: number | undefined): DailyReportSession | null {
  if (!userId || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyReportSession;
    if (!parsed?.checkInTime || !parsed?.logId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredSession(userId: number | undefined, session: DailyReportSession | null) {
  if (!userId || typeof window === 'undefined') return;
  const key = `${STORAGE_KEY}:${userId}`;
  if (!session) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, JSON.stringify(session));
}

function canUseClockActions(role: string | undefined | null): boolean {
  return role === 'agent' || role === 'admin';
}

export function DailyReportSessionProvider({ children }: { children: ReactNode }) {
  const { token, userData } = useAuth();
  const queryClient = useQueryClient();
  const userId = userData?.id;
  const role = userData?.role ?? '';

  const [session, setSession] = useState<DailyReportSession | null>(() => readStoredSession(userId));
  const [checkoutReportId, setCheckoutReportId] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const today = todayIsoDate();

  const requiresClockIn = isAgentRole(role) && !isReadOnlyDemoMode(userData);

  const { data: todayLogs = [], isLoading: sessionLoading } = useQuery({
    queryKey: ['daily-report-active-session', token, userId, today],
    queryFn: () =>
      getDailyReportLogs(token!, {
        startDate: today,
        endDate: today,
        agentId: userId,
      }),
    enabled: !!token && !!userId && canUseClockActions(role),
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (!userId || !canUseClockActions(role)) {
      setSession(null);
      return;
    }
    const active = (todayLogs as any[]).find((row) => {
      const checkInTime = row.checkInTime ?? row.check_in_time;
      const checkOutTime = row.checkOutTime ?? row.check_out_time;
      return checkInTime && !checkOutTime;
    });
    if (active) {
      const next: DailyReportSession = {
        logId: Number(active.id ?? active.reportId ?? active.report_id),
        checkInTime: String(active.checkInTime ?? active.check_in_time),
        shift: (active.shift ?? 'Day') as ShiftType,
      };
      setSession(next);
      writeStoredSession(userId, next);
      return;
    }
    setSession(null);
    writeStoredSession(userId, null);
  }, [todayLogs, userId, role]);

  const checkInMutation = useMutation({
    mutationFn: (shift: ShiftType) => dailyReportCheckIn(token!, { shift }),
    onSuccess: (data) => {
      const log = data?.log ?? data;
      const checkInTime = log?.checkInTime ?? log?.check_in_time ?? new Date().toISOString();
      const logId = Number(log?.id ?? log?.reportId);
      const shift = (log?.shift ?? 'Day') as ShiftType;
      const next: DailyReportSession = { logId, checkInTime: String(checkInTime), shift };
      setSession(next);
      writeStoredSession(userId, next);
      queryClient.invalidateQueries({ queryKey: ['admin-daily-report-logs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-daily-report-summary'] });
      queryClient.invalidateQueries({ queryKey: ['daily-report-active-session'] });
      toastSuccess('Clocked in successfully');
    },
    onError: (err) => toastApiError(err, 'Failed to clock in'),
  });

  const checkOutMutation = useMutation({
    mutationFn: () => dailyReportCheckOut(token!),
    onSuccess: (data) => {
      const log = data?.log ?? data;
      const reportId = String(log?.id ?? session?.logId ?? '');
      setSession(null);
      writeStoredSession(userId, null);
      queryClient.invalidateQueries({ queryKey: ['admin-daily-report-logs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-daily-report-summary'] });
      queryClient.invalidateQueries({ queryKey: ['daily-report-active-session'] });
      if (reportId) {
        setCheckoutReportId(reportId);
        setReportModalOpen(true);
      }
      toastSuccess('Clocked out successfully');
    },
    onError: (err) => toastApiError(err, 'Failed to clock out'),
  });

  const { data: checkoutReportRaw } = useQuery({
    queryKey: ['admin-daily-report-report', token, checkoutReportId],
    queryFn: () => getDailyReportReport(token!, checkoutReportId!),
    enabled: !!token && !!checkoutReportId && reportModalOpen,
  });

  const checkoutReport = useMemo(
    () => (checkoutReportRaw ? mapDailyReportDetail(checkoutReportRaw, checkoutReportId ?? undefined) : null),
    [checkoutReportRaw, checkoutReportId]
  );

  const checkIn = useCallback(
    (shift: ShiftType) => {
      if (!canUseClockActions(role)) return;
      checkInMutation.mutate(shift);
    },
    [checkInMutation, role]
  );

  const checkOut = useCallback(() => {
    if (!canUseClockActions(role)) return;
    if (window.confirm('Check out now?')) {
      checkOutMutation.mutate();
    }
  }, [checkOutMutation, role]);

  const isClockedIn = !!session;
  const canUseApp = !requiresClockIn || isClockedIn;

  const value = useMemo(
    () => ({
      session,
      isClockedIn,
      requiresClockIn,
      sessionLoading: requiresClockIn && sessionLoading,
      canUseApp,
      checkIn,
      checkOut,
      isCheckingIn: checkInMutation.isPending,
      isCheckingOut: checkOutMutation.isPending,
      isReportModalOpen: reportModalOpen,
    }),
    [
      session,
      isClockedIn,
      requiresClockIn,
      sessionLoading,
      canUseApp,
      checkIn,
      checkOut,
      checkInMutation.isPending,
      checkOutMutation.isPending,
      reportModalOpen,
    ]
  );

  return (
    <DailyReportSessionContext.Provider value={value}>
      {children}
      <ReportDetailsModal
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setCheckoutReportId(null);
        }}
        report={checkoutReport}
        canApprove={role === 'admin' || role === 'auditor'}
      />
    </DailyReportSessionContext.Provider>
  );
}

export function useDailyReportSession(): DailyReportSessionContextValue {
  const ctx = useContext(DailyReportSessionContext);
  if (!ctx) {
    throw new Error('useDailyReportSession must be used within DailyReportSessionProvider');
  }
  return ctx;
}
