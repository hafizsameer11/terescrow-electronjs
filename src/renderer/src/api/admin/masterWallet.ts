import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

export async function getMasterWalletBalancesSummary(token: string): Promise<{
  summary: Array<{
    walletId: string;
    label: string;
    totalUsd: number;
    totalNgn: number;
    totalBtc?: number;
    palmpayAvailableNgn?: number;
    palmpayFrozenNgn?: number;
    palmpayCurrentNgn?: number;
    palmpayUnsettledNgn?: number;
    palmpayMerchantId?: string;
    palmpayError?: string;
  }>;
}> {
  const res = await apiCall(API_ENDPOINT.ADMIN.masterWalletBalancesSummary, 'GET', undefined, token);
  return (res as any)?.data ?? { summary: [] };
}

export type UserPendingAsset = {
  walletCurrencyId: number;
  symbol: string;
  currency: string;
  blockchain: string;
  displayLabel: string;
  isToken: boolean;
  totalBalance: string;
  totalUsd: number;
  totalNgn: number;
  userCount: number;
};

export type UserPendingBucket = {
  totalUsd: number;
  totalNgn: number;
  usersWithBalance: number;
  assets: UserPendingAsset[];
};

export async function getMasterWalletUserPendingBalances(token: string): Promise<{
  totalUsd: number;
  totalNgn: number;
  usersWithBalance: number;
  assets: UserPendingAsset[];
  onChainPending: UserPendingBucket;
  virtualPending: UserPendingBucket;
}> {
  const res = await apiCall(API_ENDPOINT.ADMIN.masterWalletUserPendingBalances, 'GET', undefined, token);
  const data = (res as any)?.data ?? {};
  const empty: UserPendingBucket = { totalUsd: 0, totalNgn: 0, usersWithBalance: 0, assets: [] };
  const onChainPending = data.onChainPending ?? empty;
  const virtualPending = data.virtualPending ?? empty;
  return {
    totalUsd: data.totalUsd ?? onChainPending.totalUsd ?? 0,
    totalNgn: data.totalNgn ?? onChainPending.totalNgn ?? 0,
    usersWithBalance: data.usersWithBalance ?? onChainPending.usersWithBalance ?? 0,
    assets: data.assets ?? onChainPending.assets ?? [],
    onChainPending,
    virtualPending,
  };
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

export type MasterWalletSendEstimate = {
  symbol: string;
  network: string;
  feeAsset: string;
  availableBalance: string;
  requestedAmount: string;
  recipientAmount: string;
  networkFee: string;
  totalWalletDebit: string;
  feeDeductedFromAmount: boolean;
  sufficient: boolean;
  message?: string;
};

export async function getMasterWalletMaxDebit(
  token: string,
  params: { network: string; symbol: string }
): Promise<{
  maxWalletDebit: string;
  recipientAmount: string;
  networkFee: string;
  feeAsset: string;
} | null> {
  const searchParams = new URLSearchParams({
    network: params.network,
    symbol: params.symbol,
  });
  const res = await apiCall(
    `${API_ENDPOINT.ADMIN.masterWalletSendMaxDebit}?${searchParams}`,
    'GET',
    undefined,
    token
  );
  return (res as any)?.data ?? null;
}

export async function estimateMasterWalletSend(
  token: string,
  body: { address: string; amountCrypto: string; network: string; symbol: string }
): Promise<MasterWalletSendEstimate> {
  const res = await apiCall(API_ENDPOINT.ADMIN.masterWalletSendEstimate, 'POST', body, token);
  return (res as any)?.data;
}

export async function masterWalletSend(
  token: string,
  body: { address: string; amountCrypto?: string; amountDollar?: string; network: string; symbol: string; vendorId?: number }
): Promise<{
  success: boolean;
  txId?: number;
  txHash?: string;
  status?: string;
  requestedAmount?: string;
  recipientAmount?: string;
  networkFee?: string;
}> {
  const res = await apiCall(API_ENDPOINT.ADMIN.masterWalletSend, 'POST', body, token);
  return (res as any)?.data ?? { success: false };
}

export type DepositSweepTarget = 'master' | 'vendor';

export type DepositSweepPreview = {
  currency: string;
  blockchain: string;
  destinationType: DepositSweepTarget;
  vendorId: number | null;
  destinationAddress: string;
  destinationLabel: string;
  itemCount: number;
  totalAmount: string;
  totalAmountUsd: string;
  /** Sum of unique deposit-address on-chain balances (TronScan for USDT Tron). */
  totalOnChainAmount?: string | null;
  items: Array<{
    receiveTransactionId: string;
    customerName: string;
    amount: string;
    amountUsd: string;
    txHash: string;
    depositAddress: string;
    onChainAmount?: string | null;
  }>;
  dryRun: boolean;
};

export type DepositSweepExecuteResult = {
  batchId: string;
  performedByUserId: number;
  performedByRole: string;
  preview: DepositSweepPreview;
  results: Array<{ receiveTransactionId: string; success: boolean; txHash?: string; error?: string }>;
  summary: { total: number; succeeded: number; failed: number };
};

export async function getDepositSweepPreview(
  token: string,
  params: { currency: string; blockchain?: string; target?: DepositSweepTarget; vendorId?: number }
): Promise<DepositSweepPreview> {
  const sp = new URLSearchParams({ currency: params.currency });
  if (params.blockchain) sp.set('blockchain', params.blockchain);
  if (params.target) sp.set('target', params.target);
  if (params.vendorId != null) sp.set('vendorId', String(params.vendorId));
  const res = await apiCall(`${API_ENDPOINT.ADMIN.masterWalletSweepPreview}?${sp}`, 'GET', undefined, token);
  return (res as any)?.data;
}

export async function executeDepositSweep(
  token: string,
  body: { currency: string; blockchain?: string; target?: DepositSweepTarget; vendorId?: number; dryRun?: boolean }
): Promise<DepositSweepExecuteResult> {
  const res = await apiCall(API_ENDPOINT.ADMIN.masterWalletSweep, 'POST', body, token);
  return (res as any)?.data;
}

export async function masterWalletSwap(
  token: string,
  body: { fromSymbol: string; toSymbol: string; fromAmount?: string; toAmount?: string; receivingWallet?: string }
): Promise<{ success: boolean; txId?: number }> {
  const res = await apiCall(API_ENDPOINT.ADMIN.masterWalletSwap, 'POST', body, token);
  return (res as any)?.data ?? { success: false };
}
