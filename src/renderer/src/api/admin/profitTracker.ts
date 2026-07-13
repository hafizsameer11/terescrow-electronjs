import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

const BASE = API_ENDPOINT.ADMIN.profitTracker;

function unwrap<T>(res: unknown): T {
  const r = res as Record<string, unknown> | null | undefined;
  if (r && typeof r === 'object' && 'data' in r && (r as any).data !== undefined) return (r as any).data as T;
  return res as T;
}

export type ProfitTrackerConfigsResponse = {
  profitConfigs: unknown[];
  rateConfigs: unknown[];
  discountTiers: unknown[];
};

export async function getProfitTrackerConfigs(token: string): Promise<ProfitTrackerConfigsResponse> {
  const res = await apiCall(`${BASE}/configs`, 'GET', undefined, token);
  const data = unwrap<ProfitTrackerConfigsResponse>(res);
  return {
    profitConfigs: Array.isArray(data?.profitConfigs) ? data.profitConfigs : [],
    rateConfigs: Array.isArray(data?.rateConfigs) ? data.rateConfigs : [],
    discountTiers: Array.isArray(data?.discountTiers) ? data.discountTiers : [],
  };
}

export type ProfitLedgerQuery = {
  page?: number;
  limit?: number;
  transactionType?: string;
  asset?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
};

export type ProfitLedgerPage = {
  items: unknown[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function getProfitTrackerLedger(token: string, params?: ProfitLedgerQuery): Promise<ProfitLedgerPage> {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set('page', String(params.page));
  if (params?.limit != null) sp.set('limit', String(params.limit));
  if (params?.transactionType) sp.set('transactionType', params.transactionType);
  if (params?.asset) sp.set('asset', params.asset);
  if (params?.status) sp.set('status', params.status);
  if (params?.startDate) sp.set('startDate', params.startDate);
  if (params?.endDate) sp.set('endDate', params.endDate);
  const q = sp.toString();
  const res = await apiCall(q ? `${BASE}/ledger?${q}` : `${BASE}/ledger`, 'GET', undefined, token);
  const data = unwrap<ProfitLedgerPage>(res);
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    total: Number(data?.total) || 0,
    page: Number(data?.page) || 1,
    limit: Number(data?.limit) || 20,
    totalPages: Number(data?.totalPages) || 0,
  };
}

export type ProfitStatsQuery = {
  transactionType?: string;
  asset?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
};

export async function getProfitTrackerStats(token: string, params?: ProfitStatsQuery): Promise<Record<string, unknown>> {
  const sp = new URLSearchParams();
  if (params?.transactionType) sp.set('transactionType', params.transactionType);
  if (params?.asset) sp.set('asset', params.asset);
  if (params?.status) sp.set('status', params.status);
  if (params?.startDate) sp.set('startDate', params.startDate);
  if (params?.endDate) sp.set('endDate', params.endDate);
  const q = sp.toString();
  const res = await apiCall(q ? `${BASE}/stats?${q}` : `${BASE}/stats`, 'GET', undefined, token);
  return (unwrap(res) as Record<string, unknown>) ?? {};
}

export async function postProfitTrackerPreview(token: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await apiCall(`${BASE}/preview`, 'POST', body, token);
  return unwrap(res);
}

export async function postProfitTrackerBackfill(
  token: string,
  body: { dryRun?: boolean; limit?: number; startDate?: string; endDate?: string }
): Promise<unknown> {
  const res = await apiCall(`${BASE}/backfill`, 'POST', body, token);
  return unwrap(res);
}

export async function postProfitTrackerRecompute(
  token: string,
  body: {
    dryRun?: boolean;
    limit?: number;
    startDate?: string;
    endDate?: string;
    transactionType?: string;
    sourceTransactionType?: string;
  }
): Promise<unknown> {
  const res = await apiCall(`${BASE}/recompute`, 'POST', body, token);
  return unwrap(res);
}

export async function getProfitTrackerReconcile(token: string, limit?: number): Promise<unknown> {
  const sp = limit != null ? `?limit=${encodeURIComponent(String(limit))}` : '';
  const res = await apiCall(`${BASE}/reconcile${sp}`, 'GET', undefined, token);
  return unwrap(res);
}

export async function createProfitConfig(token: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await apiCall(`${BASE}/configs/profit`, 'POST', body, token);
  return unwrap(res);
}

export async function updateProfitConfig(token: string, id: number | string, body: Record<string, unknown>): Promise<unknown> {
  const res = await apiCall(`${BASE}/configs/profit/${encodeURIComponent(String(id))}`, 'PUT', body, token);
  return unwrap(res);
}

export async function createRateConfig(token: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await apiCall(`${BASE}/configs/rate`, 'POST', body, token);
  return unwrap(res);
}

export async function updateRateConfig(token: string, id: number | string, body: Record<string, unknown>): Promise<unknown> {
  const res = await apiCall(`${BASE}/configs/rate/${encodeURIComponent(String(id))}`, 'PUT', body, token);
  return unwrap(res);
}

export async function createDiscountTier(token: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await apiCall(`${BASE}/configs/discount-tier`, 'POST', body, token);
  return unwrap(res);
}

export async function updateDiscountTier(token: string, id: number | string, body: Record<string, unknown>): Promise<unknown> {
  const res = await apiCall(`${BASE}/configs/discount-tier/${encodeURIComponent(String(id))}`, 'PUT', body, token);
  return unwrap(res);
}
