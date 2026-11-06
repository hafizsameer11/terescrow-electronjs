import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

function unwrap<T>(res: unknown): T {
  return (res as { data?: T })?.data as T;
}

export type ObiexMarkupRange = {
  id: number;
  side: 'buy' | 'sell' | string;
  minUsd: number;
  maxUsd: number;
  percent: number;
  isActive: boolean;
  sortOrder: number;
};

export type ObiexStatus = {
  configured?: boolean;
  environment?: string;
  baseUrl?: string;
  apiKeyMasked?: string | null;
  webhookSecretConfigured?: boolean;
  settings: {
    isActive?: boolean;
    buyMode?: string;
    buyMarkupPercent?: number | null;
    sellMarkupPercent?: number | null;
    buyFlatFeeNgn?: number | null;
    sellFlatFeeNgn?: number | null;
    sellMarkupPercentGhs?: number | null;
    sellFlatFeeGhs?: number | null;
    withdrawMarkupPercentGhs?: number | null;
    withdrawFlatFeeGhs?: number | null;
    swapFeePercent?: number | null;
    receiveFeePercent?: number | null;
    collectionsTarget?: string | null;
  } | null;
  masterBalances?: unknown[];
};

export type ObiexUserWalletBalance = {
  currency: string;
  available: string;
  lastObiexMasterBalance?: string | null;
  reconcileMismatch?: boolean;
  updatedAt?: string;
};

export type ObiexUserWalletRow = {
  id: number;
  firstname?: string | null;
  lastname?: string | null;
  email?: string | null;
  username?: string | null;
  profilePicture?: string | null;
  balances: ObiexUserWalletBalance[];
};

export type ObiexUserWalletsResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  masterBalances: Array<{ currency: string; available?: unknown; raw?: unknown }>;
  users: ObiexUserWalletRow[];
};

const base = API_ENDPOINT.ADMIN.obiex;

export async function getObiexStatus(token: string): Promise<ObiexStatus> {
  const res = await apiCall(base + '/status', 'GET', undefined, token);
  return unwrap(res);
}

export async function saveObiexSettings(
  token: string,
  payload: {
    isActive?: boolean;
    buyMode?: string;
    buyMarkupPercent?: number;
    sellMarkupPercent?: number;
    buyFlatFeeNgn?: number;
    sellFlatFeeNgn?: number;
    sellMarkupPercentGhs?: number;
    sellFlatFeeGhs?: number;
    withdrawMarkupPercentGhs?: number;
    withdrawFlatFeeGhs?: number;
    swapFeePercent?: number;
    receiveFeePercent?: number;
    collectionsTarget?: string;
  }
) {
  const res = await apiCall(base + '/settings', 'PUT', payload, token);
  return unwrap(res);
}

export async function listObiexUserWallets(
  token: string,
  params?: { page?: number; limit?: number; search?: string }
): Promise<ObiexUserWalletsResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set('page', String(params.page));
  if (params?.limit) sp.set('limit', String(params.limit));
  if (params?.search) sp.set('search', params.search);
  const qs = sp.toString() ? `?${sp.toString()}` : '';
  const res = await apiCall(base + '/user-wallets' + qs, 'GET', undefined, token);
  return unwrap(res);
}

export async function listObiexMarkupRanges(
  token: string,
  side?: 'buy' | 'sell'
): Promise<ObiexMarkupRange[]> {
  const qs = side ? `?side=${side}` : '';
  const res = await apiCall(base + '/markup-ranges' + qs, 'GET', undefined, token);
  return unwrap(res) || [];
}

export type ObiexTrade = {
  id: string;
  side?: string | null;
  sourceCurrency?: string | null;
  targetCurrency?: string | null;
  sourceAmount?: string | number | null;
  targetAmount?: string | number | null;
  obiexReference?: string | null;
  obiexTransactionId?: string | null;
  obiexQuoteId?: string | null;
  obiexStatus?: string | null;
  cryptoDepositAddress?: string | null;
  withdrawAddress?: string | null;
  status?: string | null;
  providerResponse?: any;
  createdAt: string;
  updatedAt?: string | null;
  user?: {
    id: number;
    username?: string | null;
    firstname?: string | null;
    lastname?: string | null;
    profilePicture?: string | null;
    country?: string | null;
  } | null;
};

export async function listObiexTrades(token: string, limit = 100): Promise<ObiexTrade[]> {
  const res = await apiCall(
    `${base}/trades?limit=${Math.min(200, Math.max(1, limit))}`,
    'GET',
    undefined,
    token
  );
  const data = unwrap<ObiexTrade[] | { trades?: ObiexTrade[] }>(res);
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any)?.trades)) return (data as any).trades;
  return [];
}

export async function createObiexMarkupRange(
  token: string,
  payload: {
    side: 'buy' | 'sell';
    minUsd: number;
    maxUsd: number;
    percent: number;
    isActive?: boolean;
    sortOrder?: number;
  }
) {
  const res = await apiCall(base + '/markup-ranges', 'POST', payload, token);
  return unwrap(res);
}

export async function updateObiexMarkupRange(
  token: string,
  id: number,
  payload: {
    side: 'buy' | 'sell';
    minUsd: number;
    maxUsd: number;
    percent: number;
    isActive?: boolean;
    sortOrder?: number;
  }
) {
  const res = await apiCall(base + '/markup-ranges/' + id, 'PUT', payload, token);
  return unwrap(res);
}

export async function deleteObiexMarkupRange(token: string, id: number) {
  const res = await apiCall(base + '/markup-ranges/' + id, 'DELETE', undefined, token);
  return unwrap(res);
}
