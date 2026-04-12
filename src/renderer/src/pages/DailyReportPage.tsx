import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiSearch } from 'react-icons/fi';
import { useAuth } from '@renderer/context/authContext';
import CheckInModal from '@renderer/components/modal/CheckInModal';
import ReportDetailsModal from '@renderer/components/modal/ReportDetailsModal';
import ShiftSettingsModal from '@renderer/components/modal/ShiftSettingsModal';
import {
  getDailyReportLogs,
  getDailyReportSummary,
  getDailyReportChartsAvgWorkHours,
  getDailyReportChartsWorkHoursPerMonth,
  getDailyReportReport,
  dailyReportCheckIn,
  dailyReportCheckOut,
  updateDailyReportReport,
  getDailyReportShiftSettings,
  type ShiftType,
} from '@renderer/api/admin/dailyReport';
import { addThousandSeparator } from '@renderer/api/helper';
import type { DailyLogEntry, ReportDetail } from '@renderer/data/dailyReportData';

function formatIsoTime(iso: string | undefined | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return String(iso);
  }
}

function dateToWeekday(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  } catch {
    return String(dateStr);
  }
}

function formatDateShort(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
  } catch {
    return String(dateStr);
  }
}

function mapLogStatus(status: string | undefined): string {
  if (!status) return '—';
  const s = status.toLowerCase();
  if (s === 'checked_in') return 'Checked in';
  if (s === 'checked_out') return 'Checked out';
  if (s === 'on_time' || s === 'on time') return 'On time';
  if (s.includes('late')) return status;
  return status;
}

function dateRangeToStartEnd(dateRange: string): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  if (dateRange === 'Last 7 days') start.setDate(end.getDate() - 7);
  else if (dateRange === 'Last 90 days') start.setDate(end.getDate() - 90);
  else start.setDate(end.getDate() - 30);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

const DailyReportPage: React.FC = () => {
  const { userData, token } = useAuth();
  const queryClient = useQueryClient();
  const role = userData?.role ?? '';
  const isAuditorOrAdmin = role === 'admin' || role === 'auditor';

  const [activeTab, setActiveTab] = useState<'my' | 'all'>(isAuditorOrAdmin ? 'all' : 'my');
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [shiftFilter, setShiftFilter] = useState('Shift');
  const [search, setSearch] = useState('');
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [reportDetailsOpen, setReportDetailsOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [shiftSettingsOpen, setShiftSettingsOpen] = useState(false);

  const { startDate, endDate } = useMemo(() => dateRangeToStartEnd(dateRange), [dateRange]);
  const shiftParam = shiftFilter === 'Shift' ? undefined : shiftFilter;

  const { data: logsRaw = [] } = useQuery({
    queryKey: ['admin-daily-report-logs', token, startDate, endDate, shiftParam, activeTab],
    queryFn: () =>
      getDailyReportLogs(token!, {
        startDate,
        endDate,
        shift: shiftParam,
        agentId: activeTab === 'my' ? undefined : undefined,
      }),
    enabled: !!token,
  });
  const logsFiltered = useMemo(() => {
    const list = (logsRaw as any[]).map((row: any): DailyLogEntry => {
      const rawAmount = row.amountMade ?? row.amount_made;
      return {
        id: String(row.id ?? row.reportId ?? ''),
        employeeId: row.employeeId ?? row.employee_id,
        employeeName: row.employeeName ?? row.employee_name ?? '—',
        day: dateToWeekday(row.day ?? row.date),
        shift: (row.shift ?? 'Day') as ShiftType,
        date: formatDateShort(row.date ?? row.day),
        checkInTime: formatIsoTime(row.checkInTime ?? row.check_in_time),
        checkOutTime: formatIsoTime(row.checkOutTime ?? row.check_out_time),
        status: mapLogStatus(row.status),
        amountMade: typeof rawAmount === 'number' ? '$' + addThousandSeparator(rawAmount) : (rawAmount ?? '—'),
        reportPreview: row.reportPreview ?? row.report_preview ?? '—',
        reportId: (row.reportId ?? row.report_id) != null ? String(row.reportId ?? row.report_id) : undefined,
      };
    });
    if (!search?.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (r) =>
        r.employeeName.toLowerCase().includes(q) || r.reportPreview.toLowerCase().includes(q)
    );
  }, [logsRaw, search]);
  const logs = logsFiltered;

  const { data: summaryData } = useQuery({
    queryKey: ['admin-daily-report-summary', token, activeTab],
    queryFn: () => getDailyReportSummary(token!, activeTab === 'my' ? undefined : undefined),
    enabled: !!token,
  });
  const summary = {
    activeHours: typeof summaryData?.activeHours === 'number' ? `${summaryData.activeHours} hrs` : (summaryData?.activeHours ?? '0'),
    activeHoursTrend: summaryData?.activeHoursTrend != null ? `${summaryData.activeHoursTrend > 0 ? '+' : ''}${summaryData.activeHoursTrend}%` : '',
    amountEarned: typeof summaryData?.amountEarned === 'number' ? '$' + addThousandSeparator(summaryData.amountEarned) : (summaryData?.amountEarned ?? '—'),
    department: summaryData?.department ?? '—',
  };

  const { data: avgHoursData = [] } = useQuery({
    queryKey: ['admin-daily-report-charts-avg', token],
    queryFn: () => getDailyReportChartsAvgWorkHours(token!, 7),
    enabled: !!token,
  });
  const { data: monthData = [] } = useQuery({
    queryKey: ['admin-daily-report-charts-month', token],
    queryFn: () => getDailyReportChartsWorkHoursPerMonth(token!, 3),
    enabled: !!token,
  });
  const maxAvgHours = Math.max(...(avgHoursData as { hours: number }[]).map((d) => d.hours), 1);
  const maxMonthHrs = Math.max(
    ...(monthData as { workHrs: number; overTimeHrs: number }[]).flatMap((d) => [d.workHrs, d.overTimeHrs]),
    1
  );

  const { data: reportRaw } = useQuery({
    queryKey: ['admin-daily-report-report', token, selectedReportId],
    queryFn: () => getDailyReportReport(token!, selectedReportId!),
    enabled: !!token && !!selectedReportId && reportDetailsOpen,
  });
  const selectedReport: ReportDetail | null = reportRaw
    ? {
        id: String(reportRaw.id ?? selectedReportId),
        date: reportRaw.date ?? '—',
        agentName: reportRaw.agentName ?? reportRaw.agent_name ?? '—',
        position: reportRaw.position ?? '—',
        shift: (reportRaw.shift ?? 'Day') as ShiftType,
        auditorName: reportRaw.auditorName ?? reportRaw.auditor_name ?? '—',
        clockInTime: reportRaw.clockInTime ?? reportRaw.clock_in_time ?? '—',
        clockOutTime: reportRaw.clockOutTime ?? reportRaw.clock_out_time ?? '—',
        activeHours: reportRaw.activeHours ?? reportRaw.active_hours ?? '—',
        totalChatSessions: reportRaw.totalChatSessions ?? reportRaw.total_chat_sessions ?? 0,
        avgResponseTimeSec: reportRaw.avgResponseTimeSec ?? reportRaw.avg_response_time_sec ?? 0,
        giftCard: reportRaw.giftCard ?? reportRaw.gift_card ?? { purchaseAmt: '—', salesAmt: '—', profit: '—' },
        crypto: reportRaw.crypto ?? { openingBalance: '—', closingBalance: '—', profit: '—' },
        billPayments: reportRaw.billPayments ?? reportRaw.bill_payments ?? { openingBalance: '—', closingBalance: '—', profit: '—' },
        chat: reportRaw.chat ?? { successful: 0, pending: 0, unsuccessful: 0, totalProfit: '—' },
        financials: reportRaw.financials ?? { earnPayout: '—', openingBalance: '—', closingBalance: '—', totalProfit: '—' },
        status: reportRaw.status === 'approved' ? 'approved' : 'not_approved',
        myReport: reportRaw.myReport ?? reportRaw.my_report ?? '',
        auditorsReport: reportRaw.auditorsReport ?? reportRaw.auditors_report ?? '',
      }
    : null;

  const { data: shiftSettings } = useQuery({
    queryKey: ['admin-daily-report-shift-settings', token],
    queryFn: () => getDailyReportShiftSettings(token!),
    enabled: !!token && (checkInModalOpen || shiftSettingsOpen),
  });

  const checkInMutation = useMutation({
    mutationFn: (shift: ShiftType) => dailyReportCheckIn(token!, { shift }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-daily-report-logs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-daily-report-summary'] });
      setCheckInModalOpen(false);
    },
  });
  const checkOutMutation = useMutation({
    mutationFn: () => dailyReportCheckOut(token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-daily-report-logs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-daily-report-summary'] });
    },
  });
  const updateReportMutation = useMutation({
    mutationFn: ({
      id,
      status,
      auditorsReport,
      myReport,
    }: {
      id: string;
      status?: string;
      auditorsReport?: string;
      myReport?: string;
    }) => updateDailyReportReport(token!, id, { status, auditorsReport, myReport }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-daily-report-report'] });
      queryClient.invalidateQueries({ queryKey: ['admin-daily-report-logs'] });
    },
  });

  const handleCheckIn = (shift: ShiftType) => {
    checkInMutation.mutate(shift);
  };

  const handleCheckOut = () => {
    if (window.confirm('Check out now?')) checkOutMutation.mutate();
  };

  const handleApprove = (id: string) => {
    updateReportMutation.mutate({ id, status: 'approved' });
    setReportDetailsOpen(false);
    setSelectedReportId(null);
  };
  const handleDisapprove = (id: string) => {
    updateReportMutation.mutate({ id, status: 'disapproved' });
    setReportDetailsOpen(false);
    setSelectedReportId(null);
  };

  return (
    <div className="w-full p-6 space-y-6">
      <p className={`text-sm font-medium ${isAuditorOrAdmin ? 'text-gray-600' : 'text-gray-700'}`}>
        {isAuditorOrAdmin ? 'Only for auditors and main admin' : 'This section is for agents'}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'my' ? 'bg-[#147341] text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            My Report
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'all' ? 'bg-[#147341] text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            All Reports
          </button>
        </div>
        {isAuditorOrAdmin && (
          <button
            onClick={() => setShiftSettingsOpen(true)}
            className="px-4 py-2 rounded-xl font-normal bg-[#147341] text-white"
          >
            Settings
          </button>
        )}
        {!isAuditorOrAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCheckInModalOpen(true)}
              className="px-4 py-2 bg-[#147341] text-white rounded-lg font-medium hover:bg-[#0d5a2e]"
            >
              Check In
            </button>
            <button
              onClick={handleCheckOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
            >
              Check Out
            </button>
          </div>
        )}
      </div>

      <h1 className="text-[40px] font-normal text-gray-800">Daily Report</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Active Hours</p>
          <p className="text-2xl font-bold text-gray-800">{summary.activeHours}</p>
          <p className="text-sm text-green-600">{summary.activeHoursTrend}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Amount Earned</p>
          <p className="text-2xl font-bold text-gray-800">{summary.amountEarned}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Department</p>
          <p className="text-2xl font-bold text-gray-800">{summary.department}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Avg Work Hours</h2>
            <span className="text-[#147341] font-bold">70 Hours</span>
            <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>7 days</option>
            </select>
          </div>
          <div className="flex items-end gap-1 h-32">
            {avgHoursData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-[#147341]/40 rounded-t min-h-[4px]"
                  style={{ height: `${(d.hours / maxAvgHours) * 100}%` }}
                />
                <span className="text-xs text-gray-500 mt-1">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Work Hours per month</h2>
            <span className="font-bold text-gray-800">220hrs</span>
          </div>
          <div className="flex gap-4 mb-2 text-sm">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#147341]" /> Work time 200 Hrs</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-500" /> Over time 20 Hrs</span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {monthData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: '80px' }}>
                  <div
                    className="flex-1 bg-[#147341] rounded-t min-w-[8px]"
                    style={{ height: `${(d.workHrs / maxMonthHrs) * 80}px` }}
                  />
                  <div
                    className="flex-1 bg-purple-500 rounded-t min-w-[8px]"
                    style={{ height: `${(d.overTimeHrs / maxMonthHrs) * 80}px` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{d.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 flex flex-wrap items-center gap-3 border-b border-gray-100">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
          </select>
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option>Shift</option>
            <option>Day</option>
            <option>Night</option>
          </select>
          <div className="relative flex-1 min-w-[120px]">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium">
                {isAuditorOrAdmin && activeTab === 'all' && <th className="px-4 py-3">Employee</th>}
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Shift</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Check in time</th>
                <th className="px-4 py-3">Check out time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Amount Made</th>
                <th className="px-4 py-3">Report</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                  {isAuditorOrAdmin && activeTab === 'all' && (
                    <td className="px-4 py-3 text-gray-800 font-medium">{row.employeeName}</td>
                  )}
                  <td className="px-4 py-3 text-gray-800">{row.day}</td>
                  <td className="px-4 py-3 text-gray-600">{row.shift}</td>
                  <td className="px-4 py-3 text-gray-600">{row.date}</td>
                  <td className="px-4 py-3 text-gray-600">{row.checkInTime}</td>
                  <td className="px-4 py-3 text-gray-600">{row.checkOutTime}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        row.status === 'On time' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {row.status === 'On time' ? '• ' : ''}{row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.amountMade}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.reportPreview}
                    {row.reportId && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReportId(row.reportId ?? null);
                          setReportDetailsOpen(true);
                        }}
                        className="ml-1 text-[#147341] hover:underline"
                      >
                        View all
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && (
          <p className="p-6 text-center text-gray-500">No records found.</p>
        )}
      </div>

      <CheckInModal
        isOpen={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        onCheckIn={handleCheckIn}
        shiftSettings={shiftSettings}
      />
      <ReportDetailsModal
        isOpen={reportDetailsOpen}
        onClose={() => { setReportDetailsOpen(false); setSelectedReportId(null); }}
        report={selectedReport}
        canApprove={isAuditorOrAdmin}
        onApprove={handleApprove}
        onDisapprove={handleDisapprove}
      />
      <ShiftSettingsModal
        isOpen={shiftSettingsOpen}
        onClose={() => setShiftSettingsOpen(false)}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['admin-daily-report-shift-settings'] })}
      />
    </div>
  );
};

export default DailyReportPage;
