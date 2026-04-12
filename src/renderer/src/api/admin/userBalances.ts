import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

export interface AdminUserBalancesParams {
  token: string;
  sort?: string;
  startDate?: string;
  endDate?: string;
  dateRange?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getAdminUserBalances(params: AdminUserBalancesParams): Promise<{
  rows: Array<{
    id: number;
    name: string;
    email: string;
    totalBalanceUsd: number;
    totalBalanceN: number;
    cryptoBalanceUsd: number;
    cryptoBalanceN: number;
    nairaBalance: number;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { token, sort, startDate, endDate, dateRange, search, page = 1, limit = 20 } = params;
  const searchParams = new URLSearchParams();
  if (sort) searchParams.set('sort', sort);
  if (startDate) searchParams.set('startDate', startDate);
  if (endDate) searchParams.set('endDate', endDate);
  if (dateRange) searchParams.set('dateRange', dateRange);
  if (search) searchParams.set('search', search);
  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));
  const url = `${API_ENDPOINT.ADMIN.userBalances}?${searchParams.toString()}`;
  const res = await apiCall(url, 'GET', undefined, token);
  return (res as any)?.data ?? { rows: [], total: 0, page: 1, limit: 20, totalPages: 0 };
}
