export type ApiSuccess<T> = {
  status: 'success';
  message: string;
  data: T;
};

export type SwapStatus =
  | 'awaiting_payin'
  | 'payin_broadcast'
  | 'exchanging'
  | 'completed'
  | 'failed'
  | 'refunded';

export type SwapSourceType = 'received_asset' | 'master_wallet';

export interface ChangeNowCurrency {
  ticker: string;
  name: string;
  image?: string;
  network?: string;
  tokenContract?: string | null;
  buy?: boolean;
  sell?: boolean;
  legacyTicker?: string;
}

export interface ChangeNowAvailablePair {
  fromCurrency: string;
  toCurrency: string;
  fromNetwork?: string;
  toNetwork?: string;
  flow?: {
    standard?: boolean;
    'fixed-rate'?: boolean;
  };
}

export interface InternalTickerMapItem {
  id: number;
  blockchain: string;
  currency: string;
  contractAddress: string | null;
  isToken: boolean;
  changenowTicker: string;
  mappingSource: 'database' | 'fallback';
}

export interface ChangeNowQuote {
  minAmount: number;
  fromTicker: string;
  toTicker: string;
  amountFrom: string;
  fromNetwork: string | null;
  toNetwork: string | null;
  estimatedAmountTo: string | null;
  rawEstimate: Record<string, unknown>;
}

export interface AdminPayoutAddress {
  id: number;
  adminUserId: number;
  label: string | null;
  address: string;
  extraId: string | null;
  toNetworkHint: string | null;
  walletCurrencyId?: number | null;
  isDefault: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SwapOrder {
  id: number;
  sourceType: SwapSourceType;
  status: SwapStatus;
  changenowStatus: string | null;
  fromTicker: string;
  toTicker: string;
  amountFrom: string;
  expectedAmountTo: string | null;
  amountReceive: string | null;
  payinAddress: string;
  payinExtraId?: string | null;
  payoutAddress: string;
  payoutExtraId?: string | null;
  outboundTxHash: string | null;
  payinHash: string | null;
  payoutHash: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  payoutProfile?: { id: number; label: string | null; address: string };
  cryptoTransaction?: { transactionId: string; currency: string; blockchain: string };
}

export interface SwapListData {
  items: SwapOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PartnerExchangeListData {
  items: Record<string, unknown>[];
  total?: number;
  limit?: number;
  offset?: number;
}

export function swapBadgeKind(status: string): 'processing' | 'completed' | 'problem' {
  const s = status.toLowerCase();
  if (s === 'completed') return 'completed';
  if (s === 'failed' || s === 'refunded') return 'problem';
  return 'processing';
}
