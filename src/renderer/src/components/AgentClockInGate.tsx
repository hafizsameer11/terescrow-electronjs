import React from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@renderer/context/authContext';
import { useDailyReportSession } from '@renderer/context/dailyReportSessionContext';
import CheckInModal from '@renderer/components/modal/CheckInModal';
import { getDailyReportShiftSettings } from '@renderer/api/admin/dailyReport';

/**
 * Blocks agents from using the admin app until they clock in for the day.
 */
const AgentClockInGate: React.FC = () => {
  const { token } = useAuth();
  const location = useLocation();
  const { requiresClockIn, canUseApp, sessionLoading, checkIn, isCheckingIn, isReportModalOpen } =
    useDailyReportSession();

  const onLoginPage = location.pathname === '/';
  const onDailyReportPage = location.pathname.startsWith('/daily-report');
  const showGate =
    !!token &&
    requiresClockIn &&
    !onLoginPage &&
    !onDailyReportPage &&
    !isReportModalOpen &&
    !canUseApp;

  const { data: shiftSettings } = useQuery({
    queryKey: ['daily-report-shift-settings-gate', token],
    queryFn: () => getDailyReportShiftSettings(token!),
    enabled: !!token && showGate,
  });

  if (!showGate) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-[2px]"
        aria-hidden
      />
      {sessionLoading ? (
        <div className="fixed inset-0 z-[201] flex items-center justify-center pointer-events-none">
          <div className="rounded-xl bg-white px-6 py-4 shadow-xl text-sm text-gray-600">
            Checking your shift status…
          </div>
        </div>
      ) : (
        <CheckInModal
          isOpen
          required
          onClose={() => {}}
          onCheckIn={checkIn}
          isPending={isCheckingIn}
          shiftSettings={shiftSettings ?? null}
        />
      )}
    </>
  );
};

export default AgentClockInGate;
