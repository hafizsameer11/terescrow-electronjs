const KNOWN_TICKERS = new Set([
  'BTC', 'ETH', 'BNB', 'TRX', 'TRON', 'USDT', 'USDC', 'DAI', 'BUSD', 'SOL', 'LTC', 'DOGE', 'MATIC', 'BSC',
]);

/** USDT_TRON → USDT, USDC_BSC → USDC for display and matching. */
export function normalizeListCurrencyTicker(currency: string): string {
  const raw = String(currency ?? '').trim();
  if (!raw) return '—';
  if (/^https?:\/\//i.test(raw) || raw.includes('/')) {
    const seg = raw.split('/').pop()?.replace(/\.(png|jpe?g|gif|webp|svg)$/i, '') ?? '';
    const fromPath = seg.replace(/_/g, '').toUpperCase();
    if (KNOWN_TICKERS.has(fromPath)) return fromPath;
  }
  const u = raw.toUpperCase().replace(/\s+/g, '');
  const underscored = u.match(/^(USDT|USDC|DAI|BUSD|BTC|ETH|BNB|TRX|SOL|LTC|DOGE|MATIC)_(.+)$/);
  if (underscored && KNOWN_TICKERS.has(underscored[1])) return underscored[1];
  if (u.includes('_')) {
    const base = u.split('_')[0];
    if (KNOWN_TICKERS.has(base)) return base;
  }
  if (KNOWN_TICKERS.has(u)) return u;
  return raw;
}

/** Native coin ticker for a chain row (BSC → BNB, TRON → TRX). */
export function displayCurrencyForWalletRow(
  currency: string,
  blockchain: string,
  isToken?: boolean
): string {
  const norm = normalizeListCurrencyTicker(currency);
  const chain = String(blockchain ?? '').toLowerCase().trim();
  if (isToken) return norm;
  if (chain === 'bsc' && (norm === 'BSC' || norm === 'BNB')) return 'BNB';
  if ((chain === 'tron' || chain === 'trx') && (norm === 'TRON' || norm === 'TRX')) return 'TRX';
  if (chain === 'ethereum' && norm === 'ETH') return 'ETH';
  if (chain === 'bitcoin' && (norm === 'BTC' || norm === 'BITCOIN')) return 'BTC';
  if (chain === 'solana' && norm === 'SOL') return 'SOL';
  if (chain === 'litecoin' && norm === 'LTC') return 'LTC';
  if (chain === 'dogecoin' && norm === 'DOGE') return 'DOGE';
  if (chain === 'polygon' && (norm === 'MATIC' || norm === 'POLYGON')) return 'MATIC';
  return norm;
}

export function getTokenStandardLabel(
  currency: string,
  blockchain: string,
  isToken?: boolean
): string | null {
  if (isToken === false) return null;
  const c = normalizeListCurrencyTicker(currency);
  const chain = String(blockchain ?? '').toLowerCase().trim();
  const isStable = c === 'USDT' || c === 'USDC' || c === 'DAI' || c === 'BUSD';

  if (!isStable && isToken !== true) return null;

  if (chain === 'tron' || chain === 'trx') return 'TRC20';
  if (chain === 'ethereum' || chain === 'eth') return 'ERC20';
  if (chain === 'bsc' || chain === 'binance' || chain.includes('bsc')) return 'BEP20';
  if (chain === 'polygon' || chain === 'matic') return 'Polygon';
  if (chain === 'avalanche' || chain === 'avax') return 'ERC20';
  if (chain === 'arbitrum') return 'ERC20';
  if (chain === 'base') return 'ERC20';
  if (chain === 'solana' || chain === 'sol') return 'SPL';

  return isToken ? 'Token' : null;
}

/** Display label for master-wallet asset rows, e.g. "USDT TRC20 (Tron)". */
export function formatWalletCurrencyLabel(
  currency: string | null | undefined,
  blockchain: string | null | undefined,
  isToken?: boolean
): string {
  const b = String(blockchain ?? '').trim();
  const c = displayCurrencyForWalletRow(String(currency ?? '').trim(), b, isToken);
  if (!c || c === '—') return b || '—';
  if (!b) return c;
  const chainLabel =
    b.length <= 4
      ? b.toUpperCase()
      : b.charAt(0).toUpperCase() + b.slice(1).toLowerCase();
  const standard = getTokenStandardLabel(c, b, isToken);
  if (standard) return `${c} ${standard} (${chainLabel})`;
  return `${c} (${chainLabel})`;
}

/** Compact subtitle for list rows: "TRC20 · Tron". */
export function formatAssetListSubtitle(
  currency: string,
  blockchain: string,
  isToken?: boolean
): string {
  const chain = String(blockchain ?? '').trim();
  if (!chain) return '';
  const chainLabel =
    chain.length <= 4
      ? chain.toUpperCase()
      : chain.charAt(0).toUpperCase() + chain.slice(1).toLowerCase();
  const ticker = displayCurrencyForWalletRow(currency, chain, isToken);
  const standard = getTokenStandardLabel(ticker, chain, isToken);
  if (standard) return `${standard} · ${chainLabel}`;
  return chainLabel;
}

export type WalletCurrencyOption = {
  id: number;
  currency: string;
  blockchain: string;
  label: string;
};

export function mapAssetsToWalletCurrencyOptions(assets: any[]): WalletCurrencyOption[] {
  return (assets ?? [])
    .map((a) => {
      const id = a.walletCurrencyId ?? a.id ?? a.currencyId;
      const currency = a.currency ?? a.asset ?? a.symbol;
      const blockchain = a.blockchain ?? a.network ?? a.blockchainName;
      if (id == null || !currency) return null;
      return {
        id: Number(id),
        currency: String(currency),
        blockchain: String(blockchain ?? ''),
        label: formatWalletCurrencyLabel(String(currency), String(blockchain ?? ''), Boolean(a.isToken)),
      };
    })
    .filter((x): x is WalletCurrencyOption => x != null && Number.isFinite(x.id));
}
