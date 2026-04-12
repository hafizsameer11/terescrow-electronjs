/**
 * Frontend dataset for Daily Report (check-in/out, shifts, logs, report details).
 * Replace with API later.
 */

export type ShiftType = 'Day' | 'Night';

export interface ShiftSettings {
  day: { checkIn: string; checkOut: string; gracePeriod: string };
  night: { checkIn: string; checkOut: string; gracePeriod: string };
}

export const DEFAULT_SHIFT_SETTINGS: ShiftSettings = {
  day: { checkIn: '09:00', checkOut: '17:00', gracePeriod: '00:15' },
  night: { checkIn: '22:00', checkOut: '06:00', gracePeriod: '00:15' },
};

let shiftSettings: ShiftSettings = { ...DEFAULT_SHIFT_SETTINGS };

export function getShiftSettings(): ShiftSettings {
  return { ...shiftSettings };
}

export function setShiftSettings(next: ShiftSettings): void {
  shiftSettings = { ...next };
}

export interface DailyLogEntry {
  id: string;
  employeeId?: number;
  employeeName: string;
  day: string;
  shift: ShiftType;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  status: 'On time' | string;
  amountMade: string;
  reportPreview: string;
  reportId?: string;
}

export interface ReportDetail {
  id: string;
  date: string;
  agentName: string;
  position: string;
  shift: ShiftType;
  auditorName: string;
  clockInTime: string;
  clockOutTime: string;
  activeHours: string;
  totalChatSessions: number;
  avgResponseTimeSec: number;
  giftCard: { purchaseAmt: string; salesAmt: string; profit: string };
  crypto: { openingBalance: string; closingBalance: string; profit: string };
  billPayments: { openingBalance: string; closingBalance: string; profit: string };
  chat: { successful: number; pending: number; unsuccessful: number; totalProfit: string };
  financials: { earnPayout: string; openingBalance: string; closingBalance: string; totalProfit: string };
  status: 'approved' | 'not_approved';
  myReport: string;
  auditorsReport: string;
}

const MOCK_DAILY_LOGS: DailyLogEntry[] = [
  { id: '1', employeeName: 'Qamardeen', day: 'Monday', shift: 'Day', date: '10/06/25', checkInTime: '08:55 AM', checkOutTime: '04:30 PM', status: 'On time', amountMade: '$11234/N250000', reportPreview: 'I have somethin to....', reportId: 'r1' },
  { id: '2', employeeName: 'Qamardeen', day: 'Tuesday', shift: 'Day', date: '10/07/25', checkInTime: '09:30 AM', checkOutTime: '04:30 PM', status: '30 min late', amountMade: '$11234/N250000', reportPreview: '—', reportId: 'r2' },
  { id: '3', employeeName: 'Qamardeen', day: 'Wednesday', shift: 'Day', date: '10/08/25', checkInTime: '08:55 AM', checkOutTime: '04:30 PM', status: 'On time', amountMade: '$11234/N250000', reportPreview: '—', reportId: 'r3' },
  { id: '4', employeeName: 'Qamardeen', day: 'Thursday', shift: 'Day', date: '10/09/25', checkInTime: '08:55 AM', checkOutTime: '04:30 PM', status: 'On time', amountMade: '$11234/N250000', reportPreview: '—', reportId: 'r4' },
  { id: '5', employeeName: 'Alex', day: 'Monday', shift: 'Day', date: '10/06/25', checkInTime: '08:55 AM', checkOutTime: '04:30 PM', status: 'On time', amountMade: '$11234/N250000', reportPreview: 'I have somethin to....', reportId: 'r5' },
  { id: '6', employeeName: 'Sasha', day: 'Monday', shift: 'Day', date: '10/06/25', checkInTime: '08:55 AM', checkOutTime: '04:30 PM', status: 'On time', amountMade: '$11234/N250000', reportPreview: '—', reportId: 'r6' },
  { id: '7', employeeName: 'Chris', day: 'Monday', shift: 'Day', date: '10/06/25', checkInTime: '08:55 AM', checkOutTime: '04:30 PM', status: 'On time', amountMade: '$11234/N250000', reportPreview: 'I have somethin to....', reportId: 'r7' },
  { id: '8', employeeName: 'Sharon', day: 'Monday', shift: 'Day', date: '10/06/25', checkInTime: '08:55 AM', checkOutTime: '04:30 PM', status: 'On time', amountMade: '$11234/N250000', reportPreview: '—', reportId: 'r8' },
  { id: '9', employeeName: 'Adewale', day: 'Monday', shift: 'Day', date: '10/06/25', checkInTime: '08:55 AM', checkOutTime: '04:30 PM', status: 'On time', amountMade: '$11234/N250000', reportPreview: 'I have somethin to....', reportId: 'r9' },
];

const MOCK_REPORT_DETAILS: ReportDetail[] = [
  {
    id: 'r1',
    date: 'October 8, 2025',
    agentName: 'Charles Chris',
    position: 'Agent',
    shift: 'Day',
    auditorName: 'Adam',
    clockInTime: '07:30 AM',
    clockOutTime: '05:30 PM',
    activeHours: '8 hrs 58 mins',
    totalChatSessions: 20,
    avgResponseTimeSec: 30,
    giftCard: { purchaseAmt: '$300', salesAmt: '$200', profit: '$50' },
    crypto: { openingBalance: '$300', closingBalance: '$300', profit: '$30' },
    billPayments: { openingBalance: '$300', closingBalance: '$300', profit: '$15' },
    chat: { successful: 5, pending: 2, unsuccessful: 1, totalProfit: '$100' },
    financials: { earnPayout: '-$100', openingBalance: '$20,000', closingBalance: '$20,500', totalProfit: '$500' },
    status: 'not_approved',
    myReport: '',
    auditorsReport: '',
  },
];

export function getDailyLogsForAgent(agentName: string): DailyLogEntry[] {
  return MOCK_DAILY_LOGS.filter((e) => e.employeeName === agentName);
}

export function getAllDailyLogs(): DailyLogEntry[] {
  return [...MOCK_DAILY_LOGS];
}

export function getReportById(reportId: string): ReportDetail | undefined {
  const base = MOCK_REPORT_DETAILS[0];
  if (!base) return undefined;
  const found = MOCK_REPORT_DETAILS.find((r) => r.id === reportId);
  if (found) return found;
  return { ...base, id: reportId };
}

export function getSummaryForAgent(): { activeHours: string; activeHoursTrend: string; amountEarned: string; department: string } {
  return { activeHours: '700 Hours', activeHoursTrend: '↑15%', amountEarned: '$7,000', department: 'Crypto Sell' };
}

export function getAvgWorkHoursChartData(): { day: string; hours: number }[] {
  return [
    { day: 'Mon', hours: 7 },
    { day: 'Tue', hours: 6 },
    { day: 'Wed', hours: 8 },
    { day: 'Thu', hours: 7.5 },
    { day: 'Fri', hours: 6.5 },
    { day: 'Sat', hours: 4 },
    { day: 'Sun', hours: 5 },
  ];
}

export function getWorkHoursPerMonthData(): { month: string; workHrs: number; overTimeHrs: number }[] {
  return [
    { month: 'Jan', workHrs: 200, overTimeHrs: 20 },
    { month: 'Feb', workHrs: 180, overTimeHrs: 15 },
    { month: 'Mar', workHrs: 220, overTimeHrs: 25 },
  ];
}
