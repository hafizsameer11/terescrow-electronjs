/** Extract on-chain recipient addresses from verifier API snippets for admin display. */

export type OnChainRecipient = {
  address: string;
  amount: string;
  unit: string;
};

function formatBtcSats(sats: number): string {
  return (sats / 1e8).toFixed(8).replace(/\.?0+$/, '') || '0';
}

export function extractOnChainRecipients(
  rawSnippet: unknown,
  chain?: string | null
): OnChainRecipient[] {
  if (!rawSnippet || typeof rawSnippet !== 'object') return [];
  const body = rawSnippet as Record<string, unknown>;
  const chainLower = (chain ?? '').toLowerCase();
  const isUtxo = chainLower.includes('bitcoin') || chainLower === 'btc' || chainLower.includes('litecoin') || chainLower === 'ltc' || chainLower.includes('doge');

  if (isUtxo && Array.isArray(body.outputs)) {
    return (body.outputs as Array<{ address?: string; value?: number }>)
      .filter((o) => o.address)
      .map((o) => ({
        address: String(o.address),
        amount: formatBtcSats(Number(o.value ?? 0)),
        unit: chainLower.includes('litecoin') || chainLower === 'ltc' ? 'LTC' : chainLower.includes('doge') ? 'DOGE' : 'BTC',
      }));
  }

  return [];
}

export function isRetryablePending(status: string, rejectionCode?: string | null): boolean {
  if (status !== 'pending') return false;
  const code = (rejectionCode ?? '').toLowerCase();
  if (code.includes('deposit_address_mismatch')) return false;
  if (code.includes('contract_mismatch') || code.includes('unlisted') || code.includes('blocklist')) return false;
  return true;
}
