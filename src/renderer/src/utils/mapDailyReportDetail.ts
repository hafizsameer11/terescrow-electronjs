import type { ReportDetail } from '@renderer/data/dailyReportData';
import type { ShiftType } from '@renderer/api/admin/dailyReport';

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

function formatReportDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return String(dateStr);
  }
}

function formatActiveHours(value: unknown): string {
  if (value == null || value === '') return '—';
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(n)) return String(value);
  const hrs = Math.floor(n);
  const mins = Math.round((n - hrs) * 60);
  if (hrs === 0 && mins === 0) return '0 mins';
  const parts: string[] = [];
  if (hrs > 0) parts.push(`${hrs} hr${hrs !== 1 ? 's' : ''}`);
  if (mins > 0) parts.push(`${mins} min${mins !== 1 ? 's' : ''}`);
  return parts.join(' ');
}

export function mapDailyReportDetail(reportRaw: any, fallbackId?: string): ReportDetail {
  const clockInRaw = reportRaw.clockInTime ?? reportRaw.clock_in_time;
  const clockOutRaw = reportRaw.clockOutTime ?? reportRaw.clock_out_time;
  const activeRaw = reportRaw.activeHours ?? reportRaw.active_hours;

  return {
    id: String(reportRaw.id ?? fallbackId ?? ''),
    date: formatReportDate(reportRaw.date),
    agentName: reportRaw.agentName ?? reportRaw.agent_name ?? '—',
    position: reportRaw.position ?? '—',
    shift: (reportRaw.shift ?? 'Day') as ShiftType,
    auditorName: reportRaw.auditorName ?? reportRaw.auditor_name ?? '—',
    clockInTime: formatIsoTime(clockInRaw),
    clockOutTime: formatIsoTime(clockOutRaw),
    activeHours: formatActiveHours(activeRaw),
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
  };
}
