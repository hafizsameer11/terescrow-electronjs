import { addThousandSeparator } from '@renderer/api/helper';
import { formatCryptoAmountFromUnknown } from '@renderer/utils/cryptoAmountSync';
import { WALLET_ICON_BASE_URL } from '@renderer/api/config';
import {
  displayCurrencyForWalletRow,
  formatWalletCurrencyLabel,
  normalizeListCurrencyTicker,
} from '@renderer/utils/walletCurrencyLabel';

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|svg)$/i;

/** True if the API sent a filesystem-style path or image filename instead of a ticker. */
export function isWalletAssetImagePath(s: string): boolean {
  if (!s) return false;
  if (/^https?:\/\//i.test(s) || s.startsWith('data:')) return false;
  return IMAGE_EXT_RE.test(s) || s.includes('/');
}

/** Public CDN fallback when the API does not return an icon (CoinCap). */
export function cryptoIconFallbackUrl(symbol: string | undefined | null): string | undefined {
  if (symbol == null) return undefined;
  const raw = String(symbol).trim();
  if (!raw || raw === '—') return undefined;
  const tickerMap: Record<string, string> = {
    TRON: 'trx',
    USDTTRON: 'usdt',
  };
  const key = raw.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const slug = tickerMap[raw.toUpperCase()] ?? key;
  if (!slug || slug.length > 12) return undefined;
  return `https://assets.coincap.io/assets/icons/${slug}@2x.png`;
}

export function resolveWalletIconUrl(pathOrUrl: string | undefined | null): string | undefined {
  if (pathOrUrl == null || typeof pathOrUrl !== 'string') return undefined;
  const t = pathOrUrl.trim();
  if (!t) return undefined;
  if (/^https?:\/\//i.test(t) || t.startsWith('data:') || t.startsWith('file:')) return t;
  const base = WALLET_ICON_BASE_URL.replace(/\/$/, '');
  const path = t.replace(/^\//, '');
  return `${base}/${path}`;
}

export function tickerFromWalletIconPath(s: string): string | undefined {
  const seg = s.split('/').pop();
  if (!seg) return undefined;
  const base = seg.replace(IMAGE_EXT_RE, '');
  if (!base) return undefined;
  return base.replace(/_/g, '').toUpperCase();
}

/** Ticker for send/swap UI labels and API body — never an image path. */
export function sendFlowDisplayTicker(raw: string): string {
  if (raw == null || raw === '') return '';
  const s = String(raw).trim();
  if (isWalletAssetImagePath(s)) {
    const fromFile = tickerFromWalletIconPath(s);
    if (fromFile) return fromFile;
  }
  return s;
}

/** Match vendor row currency to master-wallet asset (handles TRON vs TRX, USDT_TRON, path symbols). */
export function vendorMatchesAssetSymbol(vendorCurrency: string, assetSymbolRaw: string): boolean {
  const vc = normalizeListCurrencyTicker(vendorCurrency);
  const at = normalizeListCurrencyTicker(sendFlowDisplayTicker(assetSymbolRaw) || assetSymbolRaw);
  if (!vc || !at || vc === '—' || at === '—') return false;
  if (vc === at) return true;
  if ((vc === 'TRX' && at === 'TRON') || (vc === 'TRON' && at === 'TRX')) return true;
  return false;
}

/** API often sends `name` as the human ticker (BTC, TRON, SOL) while `symbol` is an icon path. */
function isLikelyApiTickerName(nm: string): boolean {
  const t = nm.trim();
  if (t.length < 2 || t.length > 8 || /\s/.test(t)) return false;
  return /^[A-Za-z0-9]+$/.test(t);
}

/** First non-null balance field; treats 0 as valid (avoids ?? skipping zero). */
function pickBalanceField(...candidates: unknown[]): unknown {
  for (const v of candidates) {
    if (v === 0 || v === '0') return v;
    if (v != null && v !== '' && v !== '—') return v;
  }
  return undefined;
}

function coerceDisplayField(v: unknown): string {
  if (v == null || v === '') return '—';
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  const s = String(v).trim();
  if (s === '' || s === '—') return '—';
  return s;
}

/** Subtitle: prefer blockchain when name only repeats the ticker (e.g. symbol path + name "BTC"). */
function resolveAssetSubtitle(a: Record<string, any>, resolvedSymbol: string): string {
  const rawName = a.name != null ? String(a.name).trim() : '';
  const sym = resolvedSymbol.trim().toUpperCase();
  const chain = a.blockchain != null ? String(a.blockchain).trim() : '';
  if (!rawName) return chain || resolvedSymbol;
  if (rawName.toUpperCase() === sym && chain) return chain;
  return rawName;
}

export type NormalizedWalletTableRow = {
  rowKey: string;
  symbol: string;
  name: string;
  displayLabel: string;
  blockchain?: string;
  currency?: string;
  isToken?: boolean;
  sharedMasterWalletNote?: string;
  iconUrl?: string;
  /** On-chain deposit / receive address for this asset */
  address: string;
  masterBalance: string;
  masterUsd: string;
  yellowCard: string;
  yellowCardUsd: string;
  tatum: string;
  tatumUsd: string;
};

export type NormalizedWalletModalAsset = {
  rowKey: string;
  symbol: string;
  name: string;
  displayLabel: string;
  blockchain?: string;
  isToken?: boolean;
  sharedMasterWalletNote?: string;
  iconUrl?: string;
  balance: string;
  usdValue: string;
  tercescrowBalance: string;
  tercescrowUsd: string;
  yellowCardBalance: string;
  yellowCardUsd: string;
  tatumBalance: string;
  tatumUsd: string;
  address: string;
};

function resolveSymbolAndIcon(a: Record<string, any>): { symbol: string; iconUrl?: string } {
  const rawSymbol = a.symbol ?? a.asset;
  const rawStr = rawSymbol != null ? String(rawSymbol) : '';
  const separateIcon = a.icon ?? a.image ?? a.logo;
  const pathAsIcon = !separateIcon && rawStr && isWalletAssetImagePath(rawStr) ? rawStr : undefined;
  const iconSource = separateIcon ?? pathAsIcon;
  const iconUrl = iconSource != null ? resolveWalletIconUrl(String(iconSource)) : undefined;

  let symbol: string;
  if (rawStr && isWalletAssetImagePath(rawStr)) {
    const t = a.asset ?? a.ticker;
    if (t != null && String(t).trim() && !isWalletAssetImagePath(String(t))) {
      symbol = String(t).trim();
    } else {
      const nm = a.name != null ? String(a.name).trim() : '';
      const fromPath = tickerFromWalletIconPath(rawStr);
      if (nm && isLikelyApiTickerName(nm)) {
        symbol = nm.toUpperCase();
      } else {
        symbol = fromPath ?? (nm || '—');
      }
    }
  } else {
    symbol = rawStr.trim() || String(a.asset ?? '—');
  }

  return { symbol, iconUrl };
}

function shouldRebuildDisplayLabel(apiLabel: string | undefined, currency: string): boolean {
  if (!apiLabel?.trim()) return true;
  const label = apiLabel.trim();
  if (label.includes('_')) return true;
  const c = currency.toUpperCase();
  if (c && label.toUpperCase().startsWith(`${c} (`)) return true;
  return false;
}

function resolveDisplayFields(a: Record<string, any>, resolvedSymbol: string) {
  const rawCurrency = String(a.currency ?? resolvedSymbol).trim();
  const blockchain = a.blockchain != null ? String(a.blockchain).trim() : '';
  const isToken = Boolean(a.isToken);
  const currency = displayCurrencyForWalletRow(rawCurrency, blockchain, isToken);
  const apiLabel = a.displayLabel != null ? String(a.displayLabel).trim() : '';
  const displayLabel =
    currency && blockchain && shouldRebuildDisplayLabel(apiLabel, rawCurrency)
      ? formatWalletCurrencyLabel(currency, blockchain, isToken)
      : apiLabel || (currency && blockchain
          ? formatWalletCurrencyLabel(currency, blockchain, isToken)
          : resolveAssetSubtitle(a, resolvedSymbol));
  const rowKey = String(a.walletCurrencyId ?? `${rawCurrency}-${blockchain || resolvedSymbol}`);
  return { currency, blockchain, displayLabel, rowKey };
}

function parseNumericField(value: unknown): number | null {
  if (value == null || value === '' || value === '—') return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/[$,]/g, '').trim());
  return Number.isFinite(n) ? n : null;
}

/** USD value for sorting master wallet rows (highest balance first). */
export function walletRowUsdNumeric(row: Pick<NormalizedWalletTableRow, 'masterUsd'>): number {
  return parseNumericField(row.masterUsd) ?? 0;
}

export function sortWalletRowsByUsdDesc<T extends Pick<NormalizedWalletTableRow, 'masterUsd'>>(rows: T[]): T[] {
  return [...rows].sort((a, b) => walletRowUsdNumeric(b) - walletRowUsdNumeric(a));
}

/** Primary balance line: USD value (not on-chain quantity). */
export function formatMasterWalletUsdDisplay(value: unknown): string {
  const n = parseNumericField(value);
  if (n == null) {
    const s = value != null ? String(value).trim() : '';
    if (!s || s === '—') return '—';
    return s.startsWith('$') ? s : `$${s}`;
  }
  return `$${addThousandSeparator(Math.round(n * 100) / 100)}`;
}

/** Secondary line: crypto quantity held on the master wallet. */
export function formatMasterWalletQuantityDisplay(value: unknown, symbol?: string): string {
  if (value == null || value === '' || value === '—') return '—';
  const raw = String(value).trim();
  const suffix = symbol?.trim() ? ` ${symbol.trim()}` : '';
  const formatted = formatCryptoAmountFromUnknown(raw);
  if (formatted === '—') return `${raw}${suffix}`;
  return `${formatted}${suffix}`;
}

export function normalizeApiWalletTableRow(a: Record<string, any>): NormalizedWalletTableRow {
  const { symbol, iconUrl } = resolveSymbolAndIcon(a);
  const { currency, blockchain, displayLabel, rowKey } = resolveDisplayFields(a, symbol);
  const name = displayLabel;
  return {
    rowKey,
    symbol: currency || symbol,
    name,
    displayLabel,
    blockchain: blockchain || undefined,
    currency: currency || undefined,
    isToken: Boolean(a.isToken),
    sharedMasterWalletNote:
      a.sharedMasterWalletNote != null ? String(a.sharedMasterWalletNote) : undefined,
    iconUrl,
    address: coerceDisplayField(a.address ?? a.walletAddress ?? a.depositAddress),
    masterBalance: coerceDisplayField(
      pickBalanceField(a.masterBalance, a.tercescrowBalance, a.balance, a.amount)
    ),
    masterUsd: coerceDisplayField(
      pickBalanceField(a.masterUsd, a.tercescrowUsd, a.usdValue, a.usd)
    ),
    yellowCard: coerceDisplayField(pickBalanceField(a.yellowCard, a.yellow_card)),
    yellowCardUsd: coerceDisplayField(pickBalanceField(a.yellowCardUsd, a.yellow_card_usd)),
    tatum: coerceDisplayField(pickBalanceField(a.tatum, a.tatumBalance)),
    tatumUsd: coerceDisplayField(pickBalanceField(a.tatumUsd, a.tatum_usd)),
  };
}

export function normalizeApiWalletModalAsset(a: Record<string, any>): NormalizedWalletModalAsset {
  const { symbol, iconUrl } = resolveSymbolAndIcon(a);
  const { currency, blockchain, displayLabel, rowKey } = resolveDisplayFields(a, symbol);
  return {
    rowKey,
    symbol: currency || symbol,
    name: displayLabel,
    displayLabel,
    blockchain: blockchain || undefined,
    isToken: Boolean(a.isToken),
    sharedMasterWalletNote:
      a.sharedMasterWalletNote != null ? String(a.sharedMasterWalletNote) : undefined,
    iconUrl,
    balance: coerceDisplayField(pickBalanceField(a.balance, a.amount)),
    usdValue: coerceDisplayField(pickBalanceField(a.usdValue, a.usd)),
    tercescrowBalance: coerceDisplayField(
      pickBalanceField(a.tercescrowBalance, a.tercescrow, a.balance)
    ),
    tercescrowUsd: coerceDisplayField(pickBalanceField(a.tercescrowUsd)),
    yellowCardBalance: coerceDisplayField(pickBalanceField(a.yellowCard, a.yellow_card)),
    yellowCardUsd: coerceDisplayField(pickBalanceField(a.yellowCardUsd)),
    tatumBalance: coerceDisplayField(pickBalanceField(a.tatum)),
    tatumUsd: coerceDisplayField(pickBalanceField(a.tatumUsd)),
    address: coerceDisplayField(a.address ?? a.walletAddress),
  };
}
