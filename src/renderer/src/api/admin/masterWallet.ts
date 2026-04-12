import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

export async function getMasterWalletBalancesSummary(token: string): Promise<{
  summary: Array<{
    walletId: string;
    label: string;
    totalUsd: number;
    totalNgn: number;
    totalBtc?: number;
    accountName?: string;
    accountNumber?: string;
  }>;
}> {
  const res = await apiCall(API_ENDPOINT.ADMIN.masterWalletBalancesSummary, 'GET', undefined, token);
  return (res as any)?.data ?? { summary: [] };
}

export async function getMasterWalletAssets(token: string, walletId?: string): Promise<any[]> {
  const url = walletId ? `${API_ENDPOINT.ADMIN.masterWalletAssets}?walletId=${encodeURIComponent(walletId)}` : API_ENDPOINT.ADMIN.masterWalletAssets;
  const res = await apiCall(url, 'GET', undefined, token);
  const data = (res as any)?.data;
  return data?.assets ?? data ?? [];
}

export async function getMasterWalletTransactions(
  token: string,
  params?: { assetSymbol?: string; walletId?: string }
): Promise<any[]> {
  const searchParams = new URLSearchParams();
  if (params?.assetSymbol) searchParams.set('assetSymbol', params.assetSymbol);
  if (params?.walletId) searchParams.set('walletId', params.walletId);
  const url = searchParams.toString() ? `${API_ENDPOINT.ADMIN.masterWalletTransactions}?${searchParams}` : API_ENDPOINT.ADMIN.masterWalletTransactions;
  const res = await apiCall(url, 'GET', undefined, token);
  const data = (res as any)?.data;
  return data?.transactions ?? data ?? [];
}

export async function masterWalletSend(
  token: string,
  body: { address: string; amountCrypto?: string; amountDollar?: string; network: string; symbol: string; vendorId?: number }
): Promise<{ success: boolean; txId?: number }> {
  const res = await apiCall(API_ENDPOINT.ADMIN.masterWalletSend, 'POST', body, token);
  return (res as any)?.data ?? { success: false };
}

export async function masterWalletSwap(
  token: string,
  body: { fromSymbol: string; toSymbol: string; fromAmount?: string; toAmount?: string; receivingWallet?: string }
): Promise<{ success: boolean; txId?: number }> {
  const res = await apiCall(API_ENDPOINT.ADMIN.masterWalletSwap, 'POST', body, token);
  return (res as any)?.data ?? { success: false };
}
