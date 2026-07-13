const LABEL_MAP: Record<string, string> = {
  bill_payment: 'Bill payment',
  gift_card_buy: 'Gift card buy',
  gift_card_sell: 'Gift card sell',
  crypto_buy: 'Crypto buy',
  crypto_sell: 'Crypto sell',
  crypto_send: 'Crypto send',
  crypto_receive: 'Crypto receive',
  naira_deposit: 'Naira deposit',
  naira_withdrawal: 'Naira withdrawal',
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  credit: 'Credit',
  debit: 'Debit',
  transfer: 'Transfer',
  successful: 'Successful',
  pending: 'Pending',
  declined: 'Declined',
  failed: 'Failed',
  inwallet: 'In wallet',
  transferredtomaster: 'Transferred to master',
  senttovendor: 'Sent to vendor',
};

export function humanizeKey(key: string): string {
  if (!key) return '';
  const lower = key.toLowerCase();
  if (LABEL_MAP[lower]) return LABEL_MAP[lower];
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatProfitTrackerLabel(value: string | null | undefined): string {
  if (value == null || value === '') return '—';
  return humanizeKey(String(value));
}

export function formatNairaType(type: string | null | undefined): string {
  if (!type) return '—';
  const t = type.toLowerCase();
  if (t === 'deposit' || t === 'credit') return 'Deposit';
  if (t === 'withdrawal' || t === 'debit') return 'Withdrawal';
  if (t === 'transfer') return 'Transfer';
  return humanizeKey(type);
}
