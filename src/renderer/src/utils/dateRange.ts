export type DateRangePreset =
  | 'All'
  | 'Last 7 days'
  | 'Last 15 days'
  | 'Last 30 days'
  | 'Last 90 days';

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  'Last 7 days',
  'Last 15 days',
  'Last 30 days',
  'Last 90 days',
];

/** ISO date string YYYY-MM-DD for start of day (local). */
export function toDateString(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** End of local calendar day as ISO date string (for inclusive API endDate). */
export function toEndDateString(d: Date): string {
  return toDateString(d);
}

export function computeStartFromPreset(label: DateRangePreset | string): string | undefined {
  if (!label || label === 'All') return undefined;
  const now = new Date();
  const d = new Date(now);
  if (label === 'Last 7 days') d.setDate(now.getDate() - 7);
  else if (label === 'Last 15 days') d.setDate(now.getDate() - 15);
  else if (label === 'Last 30 days') d.setDate(now.getDate() - 30);
  else if (label === 'Last 90 days') d.setDate(now.getDate() - 90);
  else d.setDate(now.getDate() - 30);
  return toDateString(d);
}

export function dateRangeToStartEnd(dateRange: string): {
  startDate?: string;
  endDate?: string;
} {
  if (!dateRange || dateRange === 'All') {
    return {};
  }
  const end = new Date();
  const start = new Date();
  if (dateRange === 'Last 7 days') start.setDate(end.getDate() - 7);
  else if (dateRange === 'Last 15 days') start.setDate(end.getDate() - 15);
  else if (dateRange === 'Last 90 days') start.setDate(end.getDate() - 90);
  else if (dateRange === 'Last Year') start.setFullYear(end.getFullYear() - 1);
  else start.setDate(end.getDate() - 30);
  return {
    startDate: toDateString(start),
    endDate: toEndDateString(end),
  };
}

/** Merge explicit start/end with optional preset; preset fills gaps only. */
export function resolveDateFilters(opts: {
  startDate?: string;
  endDate?: string;
  dateRange?: string;
}): { startDate?: string; endDate?: string } {
  const preset = opts.dateRange ? dateRangeToStartEnd(opts.dateRange) : {};
  return {
    startDate: opts.startDate || preset.startDate,
    endDate: opts.endDate || preset.endDate,
  };
}

/**
 * Dates sent to the API: explicit date inputs always win.
 * Preset dropdown (Last 7 days, etc.) only applies after the user changes it (`dateRangePresetActive`).
 */
export function apiDateParams(opts: {
  startDate?: string;
  endDate?: string;
  dateRange?: string;
  dateRangePresetActive?: boolean;
}): { startDate?: string; endDate?: string } {
  const s = opts.startDate?.trim();
  const e = opts.endDate?.trim();
  if (s || e) {
    return { startDate: s || undefined, endDate: e || undefined };
  }
  if (opts.dateRangePresetActive && opts.dateRange && opts.dateRange !== 'All') {
    return dateRangeToStartEnd(opts.dateRange);
  }
  return {};
}

/** Inclusive end-of-day for Date comparisons in client-side filters. */
export function parseEndDateInclusive(endDate: string): Date {
  const d = new Date(endDate);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function matchesDateRange(
  isoDate: string,
  startDate?: string,
  endDate?: string
): boolean {
  if (!startDate && !endDate) return true;
  const t = new Date(isoDate).getTime();
  if (startDate && t < new Date(startDate).setHours(0, 0, 0, 0)) return false;
  if (endDate && t > parseEndDateInclusive(endDate).getTime()) return false;
  return true;
}
