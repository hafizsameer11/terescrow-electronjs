import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

export type ShiftType = 'Day' | 'Night';

export interface ShiftSettingsData {
  day: { checkIn: string; checkOut: string; gracePeriod: number | string };
  night: { checkIn: string; checkOut: string; gracePeriod: number | string };
}

/** Normalize backend gracePeriod (number minutes) to frontend string "00:15" */
export function normalizeGracePeriod(v: number | string): string {
  if (typeof v === 'string') return v;
  const m = Number(v) || 0;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function toShiftSettings(data: ShiftSettingsData): ShiftSettingsData {
  return {
    day: {
      ...data.day,
      gracePeriod: normalizeGracePeriod(data.day.gracePeriod),
    },
    night: {
      ...data.night,
      gracePeriod: normalizeGracePeriod(data.night.gracePeriod),
    },
  };
}

export async function getDailyReportShiftSettings(token: string): Promise<ShiftSettingsData> {
  const res = await apiCall(API_ENDPOINT.ADMIN.dailyReportShiftSettings, 'GET', undefined, token);
  const data = (res as any)?.data;
  return data ? toShiftSettings(data) : { day: { checkIn: '09:00', checkOut: '17:00', gracePeriod: '00:15' }, night: { checkIn: '22:00', checkOut: '06:00', gracePeriod: '00:15' } };
}

export async function updateDailyReportShiftSettings(token: string, payload: ShiftSettingsData): Promise<ShiftSettingsData> {
  const res = await apiCall(API_ENDPOINT.ADMIN.dailyReportShiftSettings, 'PUT', payload, token);
  const data = (res as any)?.data;
  return data ? toShiftSettings(data) : payload;
}

export async function getDailyReportLogs(
  token: string,
  params?: { startDate?: string; endDate?: string; shift?: string; agentId?: number }
): Promise<any[]> {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  if (params?.shift) searchParams.set('shift', params.shift);
  if (params?.agentId != null) searchParams.set('agentId', String(params.agentId));
  const url = searchParams.toString() ? `${API_ENDPOINT.ADMIN.dailyReportLogs}?${searchParams}` : API_ENDPOINT.ADMIN.dailyReportLogs;
  const res = await apiCall(url, 'GET', undefined, token);
  const data = (res as any)?.data;
  return data?.logs ?? data ?? [];
}

export async function getDailyReportReport(token: string, reportId: string): Promise<any> {
  const res = await apiCall(API_ENDPOINT.ADMIN.dailyReportReport(reportId), 'GET', undefined, token);
  return (res as any)?.data ?? null;
}

export async function getDailyReportSummary(
  token: string,
  params?: { agentId?: number; startDate?: string; endDate?: string }
): Promise<any> {
  const sp = new URLSearchParams();
  if (params?.agentId != null) sp.set('agentId', String(params.agentId));
  if (params?.startDate) sp.set('startDate', params.startDate);
  if (params?.endDate) sp.set('endDate', params.endDate);
  const url = sp.toString()
    ? `${API_ENDPOINT.ADMIN.dailyReportSummary}?${sp}`
    : API_ENDPOINT.ADMIN.dailyReportSummary;
  const res = await apiCall(url, 'GET', undefined, token);
  return (res as any)?.data ?? {};
}

export async function getDailyReportChartsAvgWorkHours(
  token: string,
  params?: { days?: number; startDate?: string; endDate?: string }
): Promise<{ day: string; hours: number }[]> {
  const sp = new URLSearchParams();
  sp.set('days', String(params?.days ?? 7));
  if (params?.startDate) sp.set('startDate', params.startDate);
  if (params?.endDate) sp.set('endDate', params.endDate);
  const res = await apiCall(`${API_ENDPOINT.ADMIN.dailyReportChartsAvgWorkHours}?${sp}`, 'GET', undefined, token);
  const data = (res as any)?.data;
  return data?.data ?? data ?? [];
}

export async function getDailyReportChartsWorkHoursPerMonth(
  token: string,
  params?: { months?: number; startDate?: string; endDate?: string }
): Promise<{ month: string; workHrs: number; overTimeHrs: number }[]> {
  const sp = new URLSearchParams();
  sp.set('months', String(params?.months ?? 3));
  if (params?.startDate) sp.set('startDate', params.startDate);
  if (params?.endDate) sp.set('endDate', params.endDate);
  const res = await apiCall(`${API_ENDPOINT.ADMIN.dailyReportChartsWorkHoursPerMonth}?${sp}`, 'GET', undefined, token);
  const data = (res as any)?.data;
  return data?.data ?? data ?? [];
}

export async function dailyReportCheckIn(token: string, body: { shift: ShiftType; timestamp?: string }): Promise<any> {
  const res = await apiCall(API_ENDPOINT.ADMIN.dailyReportCheckIn, 'POST', body, token);
  return (res as any)?.data;
}

export async function dailyReportCheckOut(token: string, body?: { timestamp?: string }): Promise<any> {
  const res = await apiCall(API_ENDPOINT.ADMIN.dailyReportCheckOut, 'POST', body ?? {}, token);
  return (res as any)?.data;
}

export async function updateDailyReportReport(
  token: string,
  reportId: string,
  body: { status?: string; auditorsReport?: string; myReport?: string }
): Promise<any> {
  const res = await apiCall(API_ENDPOINT.ADMIN.dailyReportReport(reportId), 'PATCH', body, token);
  return (res as any)?.data;
}
