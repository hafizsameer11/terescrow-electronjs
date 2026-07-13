/** Max decimal places for crypto quantities (on-chain / wallet amounts). */
export const CRYPTO_MAX_DECIMALS = 6;

/** Parse display amounts ($1,234.56, 0.0023, N1,000). */
export function parseAmountString(raw: string | number | null | undefined): number | null {
  if (raw == null || raw === '' || raw === '—') return null;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  const cleaned = String(raw).replace(/[$₦,\s]/g, '').replace(/^N/i, '');
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function formatUsdAmount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '$0.00';
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCryptoAmount(n: number, maxDecimals = CRYPTO_MAX_DECIMALS): string {
  if (!Number.isFinite(n) || n < 0) return '0';
  const fixed = n.toFixed(maxDecimals);
  return fixed.replace(/\.?0+$/, '') || '0';
}

/** Format API / display crypto quantity strings to at most 6 decimal places. */
export function formatCryptoAmountFromUnknown(
  value: string | number | null | undefined,
  maxDecimals = CRYPTO_MAX_DECIMALS
): string {
  if (value == null || value === '' || value === '—') return '—';
  const n = typeof value === 'number' ? value : parseAmountString(value);
  if (n == null) return String(value);
  return formatCryptoAmount(n, maxDecimals);
}

/** Implied USD price per 1 unit of crypto from wallet balance + USD value. */
export function usdPerCryptoFromBalances(
  cryptoBalance: string | undefined,
  usdBalance: string | undefined
): number | null {
  const crypto = parseAmountString(cryptoBalance);
  const usd = parseAmountString(usdBalance);
  if (crypto == null || usd == null || crypto <= 0) return null;
  return usd / crypto;
}
