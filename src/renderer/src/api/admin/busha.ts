import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

function unwrap<T>(res: unknown): T {
  return (res as { data?: T })?.data as T;
}

export type BushaCryptoAsset = {
  code: string;
  name: string;
  networks: string[];
  defaultNetwork: string;
  deposit: boolean;
  withdraw: boolean;
  rampBuy: boolean;
  rampSell: boolean;
};

export type BushaMarkupRange = {
  id: number;
  side: 'buy' | 'sell' | string;
  minUsd: number;
  maxUsd: number;
  percent: number;
  isActive: boolean;
  sortOrder: number;
};

export type BushaStatus = {
  busha: {
    configured: boolean;
    environment: string;
    baseUrl: string;
    apiKeyMasked?: string | null;
  };
  palmpay: {
    configured: boolean;
    balance: {
      availableBalanceNgn: number;
      currentBalanceNgn: number;
    } | null;
    balanceError?: string | null;
  };
  settings: {
    payoutBankCode?: string | null;
    payoutBankName?: string | null;
    payoutAccountNumber?: string | null;
    payoutAccountName?: string | null;
    payoutRecipientId?: string | null;
    sellPayoutMode?: 'palmpay_temp' | 'dashboard_bank' | string | null;
    buyMarkupPercent?: number | null;
    sellMarkupPercent?: number | null;
    isActive?: boolean;
  } | null;
  markupRanges?: BushaMarkupRange[];
  stats: { customerCount: number; tradeCount: number };
  currencies: {
    fiat: string[];
    crypto: string[];
    rampCrypto?: string[];
    networks: Record<string, string>;
    networksByCurrency?: Record<string, string[]>;
    assets?: BushaCryptoAsset[];
  };
  recentTrades: BushaTrade[];
};

export type BushaCustomer = {
  id: string;
  bushaProfileId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  countryId: string;
  status: string;
  createdAt: string;
  _count?: { trades: number };
};

export type BushaCustomerRemote = {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  country_id?: string;
  status?: string;
  type?: string;
  level?: string;
  deposit?: boolean;
  payout?: boolean;
  kyc_status?: string;
  created_at?: string;
  updated_at?: string;
};

export type BushaCustomerDetail = BushaCustomer & {
  bushaRemote?: BushaCustomerRemote | null;
  createdBy?: { id: number; firstname: string; lastname: string; email: string };
};

export type BushaBalance = {
  id: string;
  currency: string;
  name?: string;
  type?: string;
  available?: { amount: string; currency: string };
  pending?: { amount: string; currency: string };
  total?: { amount: string; currency: string };
};

export type BushaWalletResponse = {
  customer: {
    id: string;
    bushaProfileId: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
  };
  balances: BushaBalance[];
  summary: {
    total: number;
    cryptoCount: number;
    fiatCount: number;
    nonZeroCount: number;
  };
};

export type BushaTransferRemote = {
  id: string;
  quote_id?: string;
  source_currency: string;
  target_currency: string;
  source_amount: string;
  target_amount: string;
  status: string;
  pay_in?: Record<string, unknown>;
  pay_out?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type BushaTrade = {
  id: string;
  side: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: string;
  targetAmount?: string | null;
  bushaQuoteId?: string | null;
  bushaTransferId?: string | null;
  bushaStatus?: string | null;
  palmpayOrderId?: string | null;
  palmpayOrderNo?: string | null;
  palmpayStatus?: string | null;
  payInBankCode?: string | null;
  payInBankName?: string | null;
  payInAccountNumber?: string | null;
  payInAccountName?: string | null;
  payInExpiresAt?: string | null;
  cryptoDepositAddress?: string | null;
  cryptoDepositNetwork?: string | null;
  status: string;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string | null;
  userId?: number | null;
  user?: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    profilePicture?: string | null;
    country?: string;
  } | null;
  customer?: {
    email: string;
    firstName: string;
    lastName: string;
    bushaProfileId: string;
  };
};

export type BushaQuotePreview = {
  quote: {
    id: string;
    source_currency: string;
    target_currency: string;
    source_amount: string;
    target_amount: string;
    expires_at?: string;
    rate?: Record<string, unknown>;
    fees?: unknown[];
  };
  customer: BushaCustomer;
};

export type BushaSellPalmpayPayoutPrepare = {
  customer: { id: string; bushaProfileId: string; email: string };
  estimateQuote: BushaQuotePreview['quote'];
  payoutQuote: BushaQuotePreview['quote'];
  palmpay: {
    merchantOrderId: string;
    orderNo: string;
    orderStatus: number;
    amountNgn: number;
    virtualAccount: {
      bankName: string;
      accountName: string;
      accountNumber: string;
    };
    bankMapping: { bankCode: string; bankName: string; matchedBy: string };
  };
  bushaRecipient: { id: string; account_number?: string; bank_name?: string; account_name?: string };
};

export type BushaKycPayload = {
  documentType: 'national-id' | 'passport' | 'drivers-license';
  documentNumber: string;
  selfieBase64: string;
  documentImageBase64?: string;
  birthDate?: string;
};

const base = API_ENDPOINT.ADMIN.busha;

export async function getBushaStatus(token: string): Promise<BushaStatus> {
  const res = await apiCall(base + '/status', 'GET', undefined, token);
  return unwrap(res);
}

export async function saveBushaSettings(
  token: string,
  payload: {
    payoutBankCode?: string;
    payoutBankName?: string;
    payoutAccountNumber?: string;
    payoutAccountName?: string;
    payoutRecipientId?: string;
    sellPayoutMode?: 'palmpay_temp' | 'dashboard_bank';
    buyMarkupPercent?: number;
    sellMarkupPercent?: number;
    isActive?: boolean;
  }
) {
  const res = await apiCall(base + '/settings', 'PUT', payload, token);
  return unwrap(res);
}

export async function listBushaMarkupRanges(
  token: string,
  side?: 'buy' | 'sell'
): Promise<BushaMarkupRange[]> {
  const qs = side ? `?side=${side}` : '';
  const res = await apiCall(base + '/markup-ranges' + qs, 'GET', undefined, token);
  return unwrap(res) || [];
}

export async function createBushaMarkupRange(
  token: string,
  payload: {
    side: 'buy' | 'sell';
    minUsd: number;
    maxUsd: number;
    percent: number;
    isActive?: boolean;
    sortOrder?: number;
  }
): Promise<BushaMarkupRange> {
  const res = await apiCall(base + '/markup-ranges', 'POST', payload, token);
  return unwrap(res);
}

export async function updateBushaMarkupRange(
  token: string,
  id: number,
  payload: Partial<{
    side: 'buy' | 'sell';
    minUsd: number;
    maxUsd: number;
    percent: number;
    isActive: boolean;
    sortOrder: number;
  }>
): Promise<BushaMarkupRange> {
  const res = await apiCall(base + `/markup-ranges/${id}`, 'PUT', payload, token);
  return unwrap(res);
}

export async function deleteBushaMarkupRange(token: string, id: number) {
  const res = await apiCall(base + `/markup-ranges/${id}`, 'DELETE', undefined, token);
  return unwrap(res);
}

export type BushaCoinFeeConfigRow = {
  currency: string;
  name: string;
  defaultNetwork?: string;
  depositFeePercent: number;
  withdrawFeePercent: number;
  isActive: boolean;
  configured?: boolean;
};

export async function listBushaCoinFeeConfigs(token: string): Promise<{
  rows: BushaCoinFeeConfigRow[];
}> {
  const res = await apiCall(base + '/fee-configs', 'GET', undefined, token);
  return unwrap(res) || { rows: [] };
}

export async function saveBushaCoinFeeConfigs(
  token: string,
  rules: Array<{
    currency: string;
    depositFeePercent: number;
    withdrawFeePercent: number;
    isActive?: boolean;
  }>
) {
  const res = await apiCall(base + '/fee-configs', 'PUT', { rules }, token);
  return unwrap(res);
}

export type BushaFeeLedgerRow = {
  id: string;
  userId: number;
  currency: string;
  type: string;
  amountCrypto: string | number;
  status: string;
  soldAmountNgn?: string | number | null;
  soldAt?: string | null;
  createdAt: string;
  user?: {
    id: number;
    username?: string;
    firstname?: string;
    lastname?: string;
    email?: string;
  };
};

export async function listBushaFeeLedger(
  token: string,
  params?: {
    status?: string;
    currency?: string;
    search?: string;
    page?: number;
    limit?: number;
  }
): Promise<{
  rows: BushaFeeLedgerRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totals: {
    heldByCurrency: Array<{ currency: string; amount: string }>;
    soldNgnEarned: string;
  };
}> {
  const sp = new URLSearchParams();
  if (params?.status) sp.set('status', params.status);
  if (params?.currency) sp.set('currency', params.currency);
  if (params?.search) sp.set('search', params.search);
  if (params?.page) sp.set('page', String(params.page));
  if (params?.limit) sp.set('limit', String(params.limit));
  const qs = sp.toString() ? `?${sp}` : '';
  const res = await apiCall(base + '/fee-ledger' + qs, 'GET', undefined, token);
  return (
    unwrap(res) || {
      rows: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      totals: { heldByCurrency: [], soldNgnEarned: '0' },
    }
  );
}

export async function syncBushaRecipient(token: string, profileId: string) {
  const res = await apiCall(base + '/recipients/sync', 'POST', { profileId }, token);
  return unwrap(res);
}

export async function listBushaCustomers(token: string): Promise<BushaCustomer[]> {
  const res = await apiCall(base + '/customers', 'GET', undefined, token);
  return unwrap(res);
}

export type BushaTradeStats = {
  buy: number;
  sell: number;
  receive: number;
  send: number;
  convert: number;
  other: number;
  total: number;
  completed: number;
  volumeBuyNgn: number;
  volumeSellNgn: number;
};

export type BushaCustomerWalletRow = {
  id: string;
  bushaProfileId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  countryId: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  userId?: number | null;
  user?: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    profilePicture?: string | null;
  } | null;
  tradeStats: BushaTradeStats;
  lastTrade?: {
    id: string;
    side: string;
    status: string;
    sourceCurrency: string;
    targetCurrency: string;
    sourceAmount: string;
    targetAmount?: string | null;
    createdAt: string;
  } | null;
};

export type BushaCustomerWalletListResponse = {
  rows: BushaCustomerWalletRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    customers: number;
    activeCustomers: number;
    trades: number;
    statusBreakdown: Record<string, number>;
    sideBreakdown: Record<string, number>;
  };
};

export type BushaCustomerWalletOverview = {
  customer: BushaCustomerWalletRow & {
    createdBy?: { id: number; firstname: string; lastname: string; email: string };
  };
  bushaRemote?: BushaCustomerRemote | null;
  tradeStats: BushaTradeStats;
  trades: BushaTrade[];
  wallet: BushaWalletResponse | null;
  walletError?: string | null;
};

export async function listBushaCustomerWallets(
  token: string,
  params?: {
    search?: string;
    status?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }
): Promise<BushaCustomerWalletListResponse> {
  const q = new URLSearchParams();
  if (params?.search) q.set('search', params.search);
  if (params?.status) q.set('status', params.status);
  if (params?.sort) q.set('sort', params.sort);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : '';
  const res = await apiCall(base + `/customer-wallets${qs}`, 'GET', undefined, token);
  return unwrap(res);
}

export async function getBushaCustomerWalletOverview(
  token: string,
  customerId: string,
  tradeLimit = 25
): Promise<BushaCustomerWalletOverview> {
  const qs = tradeLimit ? `?tradeLimit=${tradeLimit}` : '';
  const res = await apiCall(
    base + `/customer-wallets/${encodeURIComponent(customerId)}${qs}`,
    'GET',
    undefined,
    token
  );
  return unwrap(res);
}

export async function createBushaCustomer(
  token: string,
  payload: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    countryId?: string;
    birthDate?: string;
  }
) {
  const res = await apiCall(base + '/customers', 'POST', payload, token);
  return unwrap<BushaCustomer>(res);
}

export async function getBushaCustomer(token: string, customerId: string): Promise<BushaCustomerDetail> {
  const res = await apiCall(base + `/customers/${customerId}`, 'GET', undefined, token);
  return unwrap(res);
}

export async function getBushaCustomerWallet(
  token: string,
  customerId: string,
  currency?: string
): Promise<BushaWalletResponse> {
  const qs = currency ? `?currency=${encodeURIComponent(currency)}` : '';
  const res = await apiCall(base + `/customers/${customerId}/wallet${qs}`, 'GET', undefined, token);
  return unwrap(res);
}

export async function listBushaCustomerTransfers(
  token: string,
  customerId: string,
  params?: {
    limit?: number;
    quoteId?: string;
    sourceCurrency?: string;
    targetCurrency?: string;
    status?: string;
  }
) {
  const search = new URLSearchParams();
  if (params?.limit) search.set('limit', String(params.limit));
  if (params?.quoteId) search.set('quoteId', params.quoteId);
  if (params?.sourceCurrency) search.set('sourceCurrency', params.sourceCurrency);
  if (params?.targetCurrency) search.set('targetCurrency', params.targetCurrency);
  if (params?.status) search.set('status', params.status);
  const qs = search.toString();
  const res = await apiCall(
    base + `/customers/${customerId}/transfers${qs ? `?${qs}` : ''}`,
    'GET',
    undefined,
    token
  );
  return unwrap<{ customer: { id: string; bushaProfileId: string; email: string }; transfers: BushaTransferRemote[] }>(
    res
  );
}

export async function getBushaCustomerTransfer(token: string, customerId: string, transferId: string) {
  const res = await apiCall(base + `/customers/${customerId}/transfers/${transferId}`, 'GET', undefined, token);
  return unwrap(res);
}

export async function getBushaCustomerQuote(token: string, customerId: string, quoteId: string) {
  const res = await apiCall(base + `/customers/${customerId}/quotes/${quoteId}`, 'GET', undefined, token);
  return unwrap(res);
}

export async function listBushaCustomerRecipients(token: string, customerId: string) {
  const res = await apiCall(base + `/customers/${customerId}/recipients`, 'GET', undefined, token);
  return unwrap(res);
}

export async function submitBushaCustomerKyc(token: string, customerId: string, payload: BushaKycPayload) {
  const res = await apiCall(base + `/customers/${customerId}/kyc`, 'PUT', payload, token);
  return unwrap(res);
}

export async function verifyBushaCustomer(token: string, customerId: string, kyc?: BushaKycPayload) {
  const res = await apiCall(base + `/customers/${customerId}/verify`, 'POST', kyc || {}, token);
  return unwrap(res);
}

export async function refreshBushaCustomer(token: string, customerId: string) {
  const res = await apiCall(base + `/customers/${customerId}/refresh`, 'POST', {}, token);
  return unwrap(res);
}

export async function previewBushaQuote(
  token: string,
  payload: {
    customerId: string;
    side: 'buy' | 'sell';
    sourceCurrency: string;
    targetCurrency: string;
    amount: string;
    amountField?: 'source' | 'target';
    fundingMethod?: 'temporary_bank_account' | 'balance' | 'address';
    network?: string;
    payoutToBalance?: boolean;
    payoutRecipientId?: string;
  }
): Promise<BushaQuotePreview> {
  const res = await apiCall(base + '/quote/preview', 'POST', payload, token);
  return unwrap(res);
}

export async function executeBushaBuy(
  token: string,
  payload: {
    customerId: string;
    sourceCurrency: string;
    targetCurrency: string;
    sourceAmount: string;
    autoPalmpayPayout?: boolean;
  }
) {
  const res = await apiCall(base + '/trades/buy', 'POST', payload, token);
  return unwrap<BushaTrade>(res);
}

export async function prepareBushaSellPalmpayPayout(
  token: string,
  payload: {
    customerId: string;
    sourceCurrency: string;
    targetCurrency: string;
    sourceAmount: string;
    fundingMethod?: 'balance' | 'address';
    network?: string;
  }
): Promise<BushaSellPalmpayPayoutPrepare> {
  const res = await apiCall(base + '/sell/prepare-palmpay-payout', 'POST', payload, token);
  return unwrap(res);
}

export async function executeBushaSell(
  token: string,
  payload: {
    customerId: string;
    sourceCurrency: string;
    targetCurrency: string;
    sourceAmount: string;
    fundingMethod?: 'balance' | 'address';
    network?: string;
    payoutRecipientId?: string;
    palmpayPayoutOrderId?: string;
    palmpayPayoutOrderNo?: string;
  }
) {
  const res = await apiCall(base + '/trades/sell', 'POST', payload, token);
  return unwrap<BushaTrade>(res);
}

export async function executeBushaCryptoReceive(
  token: string,
  payload: {
    customerId: string;
    currency: string;
    amount: string;
    network?: string;
  }
) {
  const res = await apiCall(base + '/trades/crypto/receive', 'POST', payload, token);
  return unwrap<BushaTrade>(res);
}

export async function executeBushaCryptoSend(
  token: string,
  payload: {
    customerId: string;
    currency: string;
    amount: string;
    destinationAddress: string;
    destinationNetwork?: string;
    memo?: string;
  }
) {
  const res = await apiCall(base + '/trades/crypto/send', 'POST', payload, token);
  return unwrap<BushaTrade>(res);
}

export async function listBushaTrades(token: string, limit = 100): Promise<BushaTrade[]> {
  const res = await apiCall(`${base}/trades?limit=${Math.min(200, Math.max(1, limit))}`, 'GET', undefined, token);
  const data = unwrap<BushaTrade[] | { trades?: BushaTrade[] }>(res);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as any).trades)) return (data as any).trades;
  return [];
}

export async function getBushaTrade(token: string, tradeId: string) {
  const res = await apiCall(base + `/trades/${tradeId}`, 'GET', undefined, token);
  return unwrap<BushaTrade>(res);
}

export async function refreshBushaTrade(token: string, tradeId: string) {
  const res = await apiCall(base + `/trades/${tradeId}/refresh`, 'POST', {}, token);
  return unwrap<BushaTrade>(res);
}

export function getNetworkOptions(
  currencies: BushaStatus['currencies'] | undefined,
  code: string
): string[] {
  if (!currencies) return [code];
  const fromMap = currencies.networksByCurrency?.[code];
  if (fromMap?.length) return fromMap;
  const def = currencies.networks?.[code];
  return def ? [def] : [code];
}
