import {
  displayCurrencyForWalletRow,
  getTokenStandardLabel,
  normalizeListCurrencyTicker,
} from '@renderer/utils/walletCurrencyLabel';
import { vendorMatchesAssetSymbol } from '@renderer/utils/masterWalletAssets';

export type DisburseNetworkOption = {
  value: string;
  label: string;
  blockchain: string;
};

export function blockchainToVendorNetwork(blockchain: string): string {
  const b = String(blockchain ?? '').toLowerCase().trim();
  if (b === 'ethereum' || b === 'eth') return 'Ethereum';
  if (b === 'tron' || b === 'trx' || b === 'trc20') return 'Tron';
  if (b === 'bitcoin' || b === 'btc') return 'Bitcoin';
  if (b === 'bsc' || b === 'binance' || b.includes('smart chain')) return 'BSC';
  if (b === 'polygon' || b === 'matic') return 'Polygon';
  if (b === 'avalanche' || b === 'avax') return 'Avax';
  if (b === 'arbitrum') return 'Arbitrum';
  if (b === 'base') return 'Base';
  if (b === 'solana' || b === 'sol') return 'Solana';
  if (b === 'litecoin' || b === 'ltc') return 'Litecoin';
  if (b === 'dogecoin' || b === 'doge') return 'Dogecoin';
  if (!b) return 'Ethereum';
  return b.charAt(0).toUpperCase() + b.slice(1);
}

export function vendorNetworkMatchesBlockchain(vendorNetwork: string, blockchain: string): boolean {
  const n = String(vendorNetwork ?? '').toLowerCase();
  const b = String(blockchain ?? '').toLowerCase();
  if (!n || !b) return true;
  if (b === 'ethereum' || b === 'eth') {
    return n.includes('eth') || n.includes('ethereum') || n === 'erc20';
  }
  if (b === 'bsc') {
    return n.includes('bsc') || n.includes('bnb') || n.includes('binance') || n.includes('bep');
  }
  if (b === 'tron' || b === 'trx') {
    return n.includes('tron') || n.includes('trx') || n.includes('trc');
  }
  if (b === 'bitcoin' || b === 'btc') return n.includes('btc') || n.includes('bitcoin');
  if (b === 'polygon' || b === 'matic') return n.includes('polygon') || n.includes('matic');
  if (b === 'avalanche' || b === 'avax') return n.includes('avax') || n.includes('avalanche');
  if (b === 'arbitrum') return n.includes('arbitrum') || n.includes('arb');
  if (b === 'base') return n.includes('base');
  if (b === 'solana' || b === 'sol') return n.includes('sol');
  if (b === 'litecoin' || b === 'ltc') return n.includes('ltc') || n.includes('litecoin');
  if (b === 'dogecoin' || b === 'doge') return n.includes('doge');
  return n.includes(b) || b.includes(n);
}

export function getDisburseNetworkOptionsForAsset(
  currency: string,
  blockchain?: string,
  isToken?: boolean
): DisburseNetworkOption[] {
  if (!blockchain?.trim()) return [];
  const chain = blockchain.trim();
  const vendorNet = blockchainToVendorNetwork(chain);
  const ticker = displayCurrencyForWalletRow(currency, chain, isToken);
  const standard = getTokenStandardLabel(ticker, chain, isToken);
  const label = standard ? `${vendorNet} (${standard})` : vendorNet;
  return [{ value: vendorNet, label, blockchain: chain }];
}

export function formatVendorDisburseLabel(v: {
  name: string;
  currency: string;
  network: string;
}): string {
  const cur = normalizeListCurrencyTicker(v.currency);
  const std = getTokenStandardLabel(cur, v.network, true);
  if (std) return `${v.name} — ${cur} ${std} (${v.network})`;
  return `${v.name} — ${cur} (${v.network})`;
}

export function vendorMatchesDisburseAsset(
  vendor: { currency: string; network: string },
  assetCurrency: string,
  assetBlockchain?: string
): boolean {
  if (!vendorMatchesAssetSymbol(vendor.currency, assetCurrency)) return false;
  if (!assetBlockchain?.trim()) return true;
  return vendorNetworkMatchesBlockchain(vendor.network, assetBlockchain);
}
