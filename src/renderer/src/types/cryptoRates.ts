export type TransactionType =
  | 'BUY'
  | 'SELL'
  | 'SWAP'
  | 'SEND'
  | 'RECEIVE'
  | 'GIFT_CARD_BUY';

/** Order matches admin `GET /api/admin/crypto/rates` grouped keys. */
export const TRANSACTION_TYPES: TransactionType[] = [
  'BUY',
  'SELL',
  'SWAP',
  'SEND',
  'RECEIVE',
  'GIFT_CARD_BUY',
];

/** Short labels for rate tier tabs (USD notional → NGN per $1, including Reloadly gift card buy). */
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  BUY: 'Buy',
  SELL: 'Sell',
  SWAP: 'Swap',
  SEND: 'Send',
  RECEIVE: 'Receive',
  GIFT_CARD_BUY: 'Gift card buy',
};

export interface CryptoRateTier {
  id: number;
  transactionType: TransactionType;
  minAmount: string | number;
  maxAmount: string | number | null;
  rate: string | number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AdminRatesGroupedResponse = Record<TransactionType, CryptoRateTier[]>;
