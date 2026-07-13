/** Map profit-tracker `byTransactionType` rows into Chats financials buckets. */

export type ProfitByTypeRow = {
  transactionType?: string;
  totalProfit?: string | number;
};

const CRYPTO_TYPES = new Set(['BUY', 'SELL', 'SWAP', 'SEND', 'RECEIVE']);
const GIFT_TYPES = new Set(['GIFT_CARD_BUY', 'GIFT_CARD_SELL']);

function parseProfit(v: string | number | undefined | null): number {
  if (v == null || v === '') return 0;
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function classifyType(transactionType: string): 'crypto' | 'gift' | 'bill' | 'earn' | 'other' {
  const t = transactionType.toUpperCase().trim();
  if (!t) return 'other';
  if (CRYPTO_TYPES.has(t)) return 'crypto';
  if (GIFT_TYPES.has(t) || t.includes('GIFT')) return 'gift';
  if (t.includes('BILL') || t === 'BILL_PAYMENT') return 'bill';
  if (t.includes('EARN') || t.includes('REFERRAL')) return 'earn';
  return 'other';
}

export function bucketChatProfitsFromLedger(byType: ProfitByTypeRow[] | undefined): {
  crypto: number;
  giftCard: number;
  billPayment: number;
  earn: number;
} {
  const out = { crypto: 0, giftCard: 0, billPayment: 0, earn: 0 };
  for (const row of byType ?? []) {
    const type = String(row.transactionType ?? '');
    const profit = parseProfit(row.totalProfit);
    const bucket = classifyType(type);
    if (bucket === 'crypto') out.crypto += profit;
    else if (bucket === 'gift') out.giftCard += profit;
    else if (bucket === 'bill') out.billPayment += profit;
    else if (bucket === 'earn') out.earn += profit;
  }
  return out;
}
