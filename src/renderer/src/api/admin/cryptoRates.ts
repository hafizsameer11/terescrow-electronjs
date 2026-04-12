import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';
import type { AdminRatesGroupedResponse, CryptoRateTier, TransactionType } from '@renderer/types/cryptoRates';

function unwrap<T>(res: unknown): T {
  const r = res as Record<string, unknown> | null | undefined;
  if (r && typeof r === 'object' && 'data' in r && r.data !== undefined) return r.data as T;
  return res as T;
}

export async function getCryptoRatesGrouped(token: string): Promise<AdminRatesGroupedResponse> {
  const res = await apiCall(API_ENDPOINT.ADMIN.cryptoRates, 'GET', undefined, token);
  const data = unwrap<AdminRatesGroupedResponse>(res);
  return data ?? ({} as AdminRatesGroupedResponse);
}

export async function getCryptoRatesByType(token: string, type: TransactionType): Promise<CryptoRateTier[]> {
  const res = await apiCall(API_ENDPOINT.ADMIN.cryptoRatesByType(type), 'GET', undefined, token);
  const data = unwrap<CryptoRateTier[]>(res);
  return Array.isArray(data) ? data : [];
}

export async function getCryptoRatesHistory(
  token: string,
  params?: { rateId?: number; transactionType?: TransactionType }
): Promise<unknown[]> {
  const sp = new URLSearchParams();
  if (params?.rateId != null) sp.set('rateId', String(params.rateId));
  if (params?.transactionType) sp.set('transactionType', params.transactionType);
  const url = sp.toString() ? `${API_ENDPOINT.ADMIN.cryptoRatesHistory}?${sp}` : API_ENDPOINT.ADMIN.cryptoRatesHistory;
  const res = await apiCall(url, 'GET', undefined, token);
  const data = unwrap<unknown[]>(res);
  return Array.isArray(data) ? data : [];
}

export async function createCryptoRate(
  token: string,
  body: {
    transactionType: TransactionType;
    minAmount: number;
    maxAmount: number | null;
    rate: number;
  }
): Promise<CryptoRateTier> {
  const res = await apiCall(API_ENDPOINT.ADMIN.cryptoRates, 'POST', body, token);
  return unwrap<CryptoRateTier>(res) as CryptoRateTier;
}

export async function updateCryptoRate(token: string, id: number, rate: number): Promise<CryptoRateTier> {
  const res = await apiCall(API_ENDPOINT.ADMIN.cryptoRateById(id), 'PUT', { rate }, token);
  return unwrap<CryptoRateTier>(res) as CryptoRateTier;
}

export async function deactivateCryptoRate(token: string, id: number): Promise<unknown> {
  const res = await apiCall(API_ENDPOINT.ADMIN.cryptoRateById(id), 'DELETE', undefined, token);
  return unwrap(res);
}
