import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

export type BalanceSortCurrency = 'ngn' | 'usd';

function normalizeBalanceRow(row: Record<string, unknown>): AdminUserBalanceRow {
  const virtualBalanceUsd = Number(row.virtualBalanceUsd ?? 0) || 0;
  const onChainBalanceUsd =
    Number(row.onChainBalanceUsd ?? row.cryptoBalanceUsd ?? 0) || 0;
  const totalBalanceUsd =
    Number(row.totalBalanceUsd ?? virtualBalanceUsd + onChainBalanceUsd) || 0;
  return {
    id: Number(row.id),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    virtualBalanceUsd,
    onChainBalanceUsd,
    totalBalanceUsd,
    nairaBalance: Number(row.nairaBalance ?? row.totalBalanceN ?? 0) || 0,
    totalBalanceN: Number(row.totalBalanceN ?? row.nairaBalance ?? 0) || 0,
  };
}

function normalizeSummary(data: Record<string, unknown>) {
  const totalVirtualUsd = Number(data.totalVirtualUsd ?? 0) || 0;
  const totalOnChainUsd =
    Number(data.totalOnChainUsd ?? data.totalCryptoDepositUsd ?? 0) || 0;
  const totalCryptoUsd =
    Number(data.totalCryptoUsd ?? totalVirtualUsd + totalOnChainUsd) || 0;
  return {
    totalVirtualUsd,
    totalOnChainUsd,
    totalCryptoUsd,
    totalNairaWallet: Number(data.totalNairaWallet ?? 0) || 0,
    totalCryptoDepositNgn: Number(data.totalCryptoDepositNgn ?? 0) || 0,
    totalDepositNgn: Number(data.totalDepositNgn ?? data.totalCryptoDepositNgn ?? 0) || 0,
    totalCryptoDepositUsd: Number(data.totalCryptoDepositUsd ?? totalOnChainUsd) || 0,
  };
}

export interface AdminUserBalancesParams {
  token: string;
  sort?: string;
  balanceCurrency?: BalanceSortCurrency;
  startDate?: string;
  endDate?: string;
  dateRange?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminUserBalanceRow {
  id: number;
  name: string;
  email: string;
  virtualBalanceUsd: number;
  onChainBalanceUsd: number;
  totalBalanceUsd: number;
  nairaBalance: number;
  totalBalanceN: number;
  cryptoBalanceUsd?: number;
  cryptoBalanceN?: number;
}

export interface AdminUserAssetBalance {
  currency: string;
  blockchain: string;
  symbol: string | null;
  iconUrl?: string | null;
  isToken?: boolean | null;
  virtualBalance: string;
  onChainBalance: string;
  totalBalance: string;
  virtualBalanceUsd: number;
  onChainBalanceUsd: number;
  totalBalanceUsd: number;
  depositAddress: string | null;
  /** Live balance at deposit address — blockchain lookup, not in ledger. */
  liveOnChainAtDeposit?: string | null;
}

export async function getAdminUserBalances(params: AdminUserBalancesParams): Promise<{
  rows: AdminUserBalanceRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { token, sort, balanceCurrency, startDate, endDate, dateRange, search, page = 1, limit = 20 } = params;
  const searchParams = new URLSearchParams();
  if (sort) searchParams.set('sort', sort);
  if (balanceCurrency) searchParams.set('balanceCurrency', balanceCurrency);
  if (startDate) searchParams.set('startDate', startDate);
  if (endDate) searchParams.set('endDate', endDate);
  if (dateRange) searchParams.set('dateRange', dateRange);
  if (search) searchParams.set('search', search);
  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));
  const url = `${API_ENDPOINT.ADMIN.userBalances}?${searchParams.toString()}`;
  const res = await apiCall(url, 'GET', undefined, token);
  const payload = (res as any)?.data ?? { rows: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  return {
    ...payload,
    rows: Array.isArray(payload.rows)
      ? payload.rows.map((row: Record<string, unknown>) => normalizeBalanceRow(row))
      : [],
  };
}

export async function getAdminUserBalancesSummary(token: string): Promise<{
  totalVirtualUsd: number;
  totalOnChainUsd: number;
  totalCryptoUsd: number;
  totalNairaWallet: number;
  totalCryptoDepositNgn: number;
  totalDepositNgn: number;
  totalCryptoDepositUsd: number;
}> {
  const res = await apiCall(API_ENDPOINT.ADMIN.userBalancesSummary, 'GET', undefined, token);
  return normalizeSummary((res as any)?.data ?? {});
}

export async function getAdminUserAssetBalances(
  token: string,
  userId: number
): Promise<{ assets: AdminUserAssetBalance[] }> {
  const url = `${API_ENDPOINT.ADMIN.userBalances}/${userId}/assets`;
  const res = await apiCall(url, 'GET', undefined, token);
  return (res as any)?.data ?? { assets: [] };
}

export interface AdminUserDepositActivity {
  transactionId: string;
  txHash: string;
  currency: string;
  blockchain: string;
  amount: string;
  amountUsd: string;
  status: string;
  depositStatus: string;
  soldAmountUsd: string;
  userRetentionUsd: string;
  onChainDepositBalance: string | null;
  date: string;
}

export interface AdminUserVirtualActivity {
  transactionId: string;
  activityType: 'purchase' | 'sell' | 'send';
  balanceBucket: string | null;
  sellBatchId: string | null;
  currency: string;
  blockchain: string;
  amount: string;
  amountUsd: string;
  amountNaira: string;
  status: string;
  date: string;
}

export interface AdminOnChainSurplusTransfer {
  id: number;
  currency: string;
  blockchain: string;
  amount: string;
  amountUsd: string | null;
  toAddress: string;
  sourceDepositAddress: string;
  txHash: string | null;
  gasFundingTxHash: string | null;
  status: string;
  liveBalanceAtSend: string | null;
  recordedOnChainAtSend: string | null;
  surplusAtSend: string | null;
  date: string;
}

export interface AdminUserWalletDetail {
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    username: string | null;
    profilePicture: string | null;
  };
  balances: AdminUserBalanceRow;
  assets: AdminUserAssetBalance[];
  deposits: AdminUserDepositActivity[];
  virtualActivity: AdminUserVirtualActivity[];
  surplusTransfers?: AdminOnChainSurplusTransfer[];
}

export async function getAdminUserWalletDetail(
  token: string,
  userId: number
): Promise<AdminUserWalletDetail> {
  const url = `${API_ENDPOINT.ADMIN.userBalances}/${userId}/detail`;
  const res = await apiCall(url, 'GET', undefined, token);
  return (res as any)?.data;
}

export interface TransferOnChainSurplusParams {
  currency: string;
  blockchain: string;
  toAddress: string;
  amount?: string;
}

export interface TransferOnChainSurplusResult {
  id: number;
  txHash: string;
  amount: string;
  toAddress: string;
  surplusAmount: string;
  liveBalance: string;
  recordedOnChain: string;
  gasFundingTxHash?: string;
  status: string;
}

export async function fraudWalletCleanup(
  token: string,
  userId: number,
  body?: { receiveTxHash?: string }
): Promise<{ actions: string[]; ngnBefore?: string; ngnAfter?: string }> {
  const url = `${API_ENDPOINT.ADMIN.userBalances}/${userId}/fraud-cleanup`;
  const res = await apiCall(url, 'POST', body ?? {}, token);
  return (res as any)?.data;
}

export async function transferAdminOnChainSurplus(
  token: string,
  userId: number,
  body: TransferOnChainSurplusParams
): Promise<TransferOnChainSurplusResult> {
  const url = `${API_ENDPOINT.ADMIN.userBalances}/${userId}/transfer-surplus`;
  const res = await apiCall(url, 'POST', body, token);
  return (res as any)?.data;
}
