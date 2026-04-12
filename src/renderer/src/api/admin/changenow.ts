import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';
import type {
  AdminPayoutAddress,
  ChangeNowAvailablePair,
  ChangeNowCurrency,
  ChangeNowQuote,
  InternalTickerMapItem,
  PartnerExchangeListData,
  SwapListData,
  SwapOrder,
  SwapSourceType,
} from '@renderer/types/changenow';

export async function getChangeNowCurrencies(token: string): Promise<{ items: ChangeNowCurrency[] }> {
  const res = await apiCall(API_ENDPOINT.ADMIN.changenowCurrencies, 'GET', undefined, token);
  return (res as any)?.data ?? { items: [] };
}

export async function getChangeNowAvailablePairs(
  token: string,
  params?: {
    fromCurrency?: string;
    toCurrency?: string;
    fromNetwork?: string;
    toNetwork?: string;
    flow?: 'standard' | 'fixed-rate';
  }
): Promise<{ items: ChangeNowAvailablePair[] }> {
  const sp = new URLSearchParams();
  if (params?.fromCurrency) sp.set('fromCurrency', params.fromCurrency);
  if (params?.toCurrency) sp.set('toCurrency', params.toCurrency);
  if (params?.fromNetwork) sp.set('fromNetwork', params.fromNetwork);
  if (params?.toNetwork) sp.set('toNetwork', params.toNetwork);
  if (params?.flow) sp.set('flow', params.flow);
  const url = sp.toString() ? `${API_ENDPOINT.ADMIN.changenowAvailablePairs}?${sp.toString()}` : API_ENDPOINT.ADMIN.changenowAvailablePairs;
  const res = await apiCall(url, 'GET', undefined, token);
  return (res as any)?.data ?? { items: [] };
}

export async function getChangeNowInternalMap(token: string): Promise<{ items: InternalTickerMapItem[] }> {
  const res = await apiCall(API_ENDPOINT.ADMIN.changenowMapInternal, 'GET', undefined, token);
  return (res as any)?.data ?? { items: [] };
}

export async function upsertChangeNowTickerMapping(
  token: string,
  walletCurrencyId: number | string,
  changenowTicker: string
): Promise<Record<string, unknown>> {
  const res = await apiCall(
    API_ENDPOINT.ADMIN.changenowTickerMapping(walletCurrencyId),
    'PUT',
    { changenowTicker },
    token
  );
  return (res as any)?.data ?? {};
}

export async function getChangeNowQuote(
  token: string,
  params: { fromTicker: string; toTicker: string; amount: string | number }
): Promise<ChangeNowQuote | null> {
  const sp = new URLSearchParams();
  sp.set('fromTicker', params.fromTicker);
  sp.set('toTicker', params.toTicker);
  sp.set('amount', String(params.amount));
  const res = await apiCall(`${API_ENDPOINT.ADMIN.changenowQuote}?${sp.toString()}`, 'GET', undefined, token);
  return (res as any)?.data ?? null;
}

export async function getChangeNowNetworkFee(
  token: string,
  params: {
    fromTicker: string;
    toTicker: string;
    amount: string | number;
    fromNetwork?: string;
    toNetwork?: string;
    convertedCurrency?: string;
    convertedNetwork?: string;
  }
): Promise<Record<string, unknown>> {
  const sp = new URLSearchParams();
  sp.set('fromTicker', params.fromTicker);
  sp.set('toTicker', params.toTicker);
  sp.set('amount', String(params.amount));
  if (params.fromNetwork) sp.set('fromNetwork', params.fromNetwork);
  if (params.toNetwork) sp.set('toNetwork', params.toNetwork);
  if (params.convertedCurrency) sp.set('convertedCurrency', params.convertedCurrency);
  if (params.convertedNetwork) sp.set('convertedNetwork', params.convertedNetwork);
  const res = await apiCall(`${API_ENDPOINT.ADMIN.changenowNetworkFee}?${sp.toString()}`, 'GET', undefined, token);
  return (res as any)?.data ?? {};
}

export async function getChangeNowPayoutAddresses(token: string): Promise<{ items: AdminPayoutAddress[] }> {
  const res = await apiCall(API_ENDPOINT.ADMIN.changenowPayoutAddresses, 'GET', undefined, token);
  return (res as any)?.data ?? { items: [] };
}

export async function createChangeNowPayoutAddress(
  token: string,
  body: {
    label?: string;
    address: string;
    extraId?: string | null;
    toNetworkHint?: string | null;
    isDefault?: boolean;
  }
): Promise<AdminPayoutAddress> {
  const res = await apiCall(API_ENDPOINT.ADMIN.changenowPayoutAddresses, 'POST', body, token);
  return (res as any)?.data;
}

export async function updateChangeNowPayoutAddress(
  token: string,
  id: number | string,
  body: {
    label?: string | null;
    address?: string;
    extraId?: string | null;
    toNetworkHint?: string | null;
    isDefault?: boolean;
    archived?: boolean;
  }
): Promise<AdminPayoutAddress> {
  const res = await apiCall(API_ENDPOINT.ADMIN.changenowPayoutAddress(id), 'PATCH', body, token);
  return (res as any)?.data;
}

export async function archiveChangeNowPayoutAddress(token: string, id: number | string): Promise<Record<string, unknown>> {
  const res = await apiCall(API_ENDPOINT.ADMIN.changenowPayoutAddress(id), 'DELETE', undefined, token);
  return (res as any)?.data ?? {};
}

export async function createChangeNowSwap(
  token: string,
  body:
    | {
        sourceType: 'received_asset';
        receiveTransactionId: string;
        fromTicker: string;
        toTicker: string;
        amountFrom: string;
        payoutAddressId: number;
        refundAddress?: string;
      }
    | {
        sourceType: 'master_wallet';
        masterWalletBlockchain: string;
        walletCurrencyId: number;
        fromTicker: string;
        toTicker: string;
        amountFrom: string;
        payoutAddressId: number;
        refundAddress?: string;
      }
): Promise<SwapOrder> {
  const res = await apiCall(API_ENDPOINT.ADMIN.changenowSwaps, 'POST', body, token);
  return (res as any)?.data;
}

export async function getChangeNowSwaps(
  token: string,
  params?: { page?: number; limit?: number; status?: string }
): Promise<SwapListData> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set('page', String(params.page));
  if (params?.limit) sp.set('limit', String(params.limit));
  if (params?.status) sp.set('status', params.status);
  const url = sp.toString() ? `${API_ENDPOINT.ADMIN.changenowSwaps}?${sp.toString()}` : API_ENDPOINT.ADMIN.changenowSwaps;
  const res = await apiCall(url, 'GET', undefined, token);
  return (res as any)?.data ?? { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
}

export async function getChangeNowSwapById(token: string, id: number | string): Promise<SwapOrder | null> {
  const res = await apiCall(API_ENDPOINT.ADMIN.changenowSwap(id), 'GET', undefined, token);
  return (res as any)?.data ?? null;
}

export async function refreshChangeNowSwap(token: string, id: number | string): Promise<SwapOrder | null> {
  const res = await apiCall(API_ENDPOINT.ADMIN.changenowSwapRefresh(id), 'POST', undefined, token);
  return (res as any)?.data ?? null;
}

export async function getChangeNowPartnerExchanges(
  token: string,
  params?: {
    limit?: number;
    offset?: number;
    sortDirection?: 'ASC' | 'DESC';
    sortField?: 'createdAt' | 'updatedAt';
    dateField?: 'createdAt' | 'updatedAt';
    dateFrom?: string;
    dateTo?: string;
    requestId?: string;
    userId?: string;
    payoutAddress?: string;
    statuses?: string;
  }
): Promise<PartnerExchangeListData> {
  const sp = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v != null && v !== '') sp.set(k, String(v));
  });
  const url = sp.toString()
    ? `${API_ENDPOINT.ADMIN.changenowPartnerExchanges}?${sp.toString()}`
    : API_ENDPOINT.ADMIN.changenowPartnerExchanges;
  const res = await apiCall(url, 'GET', undefined, token);
  const data = (res as any)?.data ?? {};
  if (Array.isArray(data)) return { items: data };
  return { items: data?.items ?? [], total: data?.total, limit: data?.limit, offset: data?.offset };
}

export function changenowSourceTypeLabel(sourceType: SwapSourceType): string {
  return sourceType === 'received_asset' ? 'Received asset' : 'Master wallet';
}
