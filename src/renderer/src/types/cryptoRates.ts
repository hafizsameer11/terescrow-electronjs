export type TransactionType =
  | 'BUY'
  | 'SELL'
  | 'SWAP'
  | 'SEND'
  | 'RECEIVE'
  | 'GIFT_CARD_BUY';

/** Crypto exchange rate tiers (Rates → Crypto tab). */
export const CRYPTO_TRANSACTION_TYPES: TransactionType[] = [
  'BUY',
  'SELL',
  'SWAP',
  'SEND',
  'RECEIVE',
];

/** Gift card buy tiers (Rates → Gift card buy tab). */
export const GIFT_CARD_TRANSACTION_TYPES: TransactionType[] = ['GIFT_CARD_BUY'];

/** All tier types returned by `GET /api/admin/crypto/rates`. */
export const TRANSACTION_TYPES: TransactionType[] = [
  ...CRYPTO_TRANSACTION_TYPES,
  ...GIFT_CARD_TRANSACTION_TYPES,
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
  /** BUY/SELL: +/- % applied to base rate (e.g. -5, 10, "-10%"). */
  adjustmentPercent?: string | number | null;
  /** Computed NGN/$ when base + adjustment apply. */
  effectiveRate?: string | number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CryptoRateBaseRates = Partial<Record<'BUY' | 'SELL', number | null>>;

export type AdminRatesGroupedResponse = Record<TransactionType, CryptoRateTier[]>;

export const PERCENT_ADJUSTMENT_TRANSACTION_TYPES: TransactionType[] = ['BUY', 'SELL'];

export function usesPercentRateTiers(type: TransactionType): boolean {
  return PERCENT_ADJUSTMENT_TRANSACTION_TYPES.includes(type);
}

/** effective NGN/$ = round(base × (1 + adjustment% / 100)) — Naira has no decimals */
export function effectiveRateFromBase(base: number, adjustmentPercent: number): number {
  return Math.round(base * (1 + adjustmentPercent / 100));
}

/** Display NGN exchange rate (whole number, with thousands separators). */
export function formatNairaRate(value: string | number | null | undefined): string {
  if (value == null || value === '') return '0';
  const n = typeof value === 'number' ? value : Number(String(value).replace(/,/g, '').trim());
  if (!Number.isFinite(n)) return '0';
  return Math.round(n).toLocaleString('en-US');
}
