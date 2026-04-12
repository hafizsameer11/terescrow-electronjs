import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

/**
 * Backend `niche` values map to frontend page routes:
 *   crypto      → /transactions/crypto
 *   giftcard    → /transactions/gift-card-buy  (with type=buy), or Gift Cards tab
 *   billpayment → /transactions/bill-payments
 *   naira       → /transactions/naira
 * Omit for all transaction types.
 */
export type TransactionNiche = 'crypto' | 'giftcard' | 'billpayment' | 'naira';
export type TransactionBuySell = 'buy' | 'sell';

export interface AdminTransactionsParams {
  token: string;
  niche?: TransactionNiche;
  type?: TransactionBuySell;
  status?: 'successful' | 'pending' | 'declined';
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export async function getAdminTransactions(params: AdminTransactionsParams): Promise<{
  transactions: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { token, niche, type, status, startDate, endDate, search, page = 1, limit = 20 } = params;
  const sp = new URLSearchParams();
  if (niche) sp.set('niche', niche);
  if (type) sp.set('type', type);
  if (status) sp.set('status', status);
  if (startDate) sp.set('startDate', startDate);
  if (endDate) sp.set('endDate', endDate);
  if (search) sp.set('search', search);
  sp.set('page', String(page));
  sp.set('limit', String(limit));
  const url = `${API_ENDPOINT.ADMIN.transactions}?${sp}`;
  const res = await apiCall(url, 'GET', undefined, token);
  return (res as any)?.data ?? { transactions: [], total: 0, page: 1, limit: 20, totalPages: 0 };
}

export async function getAdminTransactionsByCustomer(
  token: string,
  customerId: string | number,
  params?: Omit<AdminTransactionsParams, 'token'>
): Promise<{
  transactions: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const sp = new URLSearchParams();
  if (params?.niche) sp.set('niche', params.niche);
  if (params?.type) sp.set('type', params.type);
  if (params?.status) sp.set('status', params.status);
  if (params?.startDate) sp.set('startDate', params.startDate);
  if (params?.endDate) sp.set('endDate', params.endDate);
  if (params?.search) sp.set('search', params.search);
  sp.set('page', String(params?.page ?? 1));
  sp.set('limit', String(params?.limit ?? 20));
  const url = `${API_ENDPOINT.ADMIN.transactionsByCustomer(customerId)}?${sp}`;
  const res = await apiCall(url, 'GET', undefined, token);
  return (res as any)?.data ?? { transactions: [], total: 0, page: 1, limit: 20, totalPages: 0 };
}

export async function getAdminTransactionStats(
  token: string,
  params?: { niche?: TransactionNiche; startDate?: string; endDate?: string }
): Promise<any> {
  const sp = new URLSearchParams();
  if (params?.niche) sp.set('niche', params.niche);
  if (params?.startDate) sp.set('startDate', params.startDate);
  if (params?.endDate) sp.set('endDate', params.endDate);
  const url = sp.toString() ? `${API_ENDPOINT.ADMIN.transactionStats}?${sp}` : API_ENDPOINT.ADMIN.transactionStats;
  const res = await apiCall(url, 'GET', undefined, token);
  return (res as any)?.data ?? {};
}
