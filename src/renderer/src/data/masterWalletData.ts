/**
 * Frontend dataset for all Master Wallets. Replace with API later.
 */

/** Single admin master wallet; Yellow Card / Palmpay variants removed from UI. */
export type WalletId = 'tercescrow';

export const MASTER_WALLET_ID: WalletId = 'tercescrow';
export const MASTER_WALLET_LABEL = 'Tercescrow Master Wallet';

export interface WalletBalanceSummary {
  walletId: WalletId;
  label: string;
  totalUsd: string;
  totalNgn: string;
  totalBtc?: string;
  /** Palmpay only */
  accountName?: string;
  accountNumber?: string;
}

export interface WalletAssetItem {
  symbol: string;
  name: string;
  balance: string;
  usdValue: string;
  /** Per-wallet balances for table */
  tercescrowBalance: string;
  tercescrowUsd: string;
  yellowCardBalance: string;
  yellowCardUsd: string;
  tatumBalance: string;
  tatumUsd: string;
  /** For Copy Address */
  address: string;
}

export interface WalletTransaction {
  id: string;
  to: string;
  status: 'successful' | 'pending' | 'failed';
  type: string;
  wallet: string;
  amount: string;
  date: string;
  assetSymbol: string;
  walletId: WalletId;
}

export const WALLET_OPTIONS: { id: WalletId; label: string }[] = [{ id: MASTER_WALLET_ID, label: MASTER_WALLET_LABEL }];

/** Balance summary per wallet (for green card) */
export const WALLET_BALANCES: Record<WalletId, WalletBalanceSummary> = {
  tercescrow: {
    walletId: 'tercescrow',
    label: MASTER_WALLET_LABEL,
    totalUsd: '$50,000',
    totalNgn: 'N20,000,000,000',
    totalBtc: '10 BTC',
  },
};

/** All assets with balances per wallet type (for table + Wallet Assets modal) */
export const WALLET_ASSETS: WalletAssetItem[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin Wallet',
    balance: '10 BTC',
    usdValue: '$10,000,000',
    tercescrowBalance: '10 BTC',
    tercescrowUsd: '$10,000,000',
    yellowCardBalance: '2 BTC',
    yellowCardUsd: '$2,000,000',
    tatumBalance: '5 BTC',
    tatumUsd: '$5,000,000',
    address: '0xbtc1example123456789',
  },
  {
    symbol: 'USDT',
    name: 'Tether Wallet',
    balance: '10 USDT',
    usdValue: '$10,000,000',
    tercescrowBalance: '10 USDT',
    tercescrowUsd: '$10,000,000',
    yellowCardBalance: '2 USDT',
    yellowCardUsd: '$2,000,000',
    tatumBalance: '5 USDT',
    tatumUsd: '$5,000,000',
    address: '0xusdt1example123456789',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum Wallet',
    balance: '10 ETH',
    usdValue: '$10,000,000',
    tercescrowBalance: '10 ETH',
    tercescrowUsd: '$10,000,000',
    yellowCardBalance: '2 ETH',
    yellowCardUsd: '$2,000,000',
    tatumBalance: '5 ETH',
    tatumUsd: '$5,000,000',
    address: '0x238fenwejcsniw9dicisndwincsnk',
  },
  {
    symbol: 'SOL',
    name: 'Solana Wallet',
    balance: '10 SOL',
    usdValue: '$10,000,000',
    tercescrowBalance: '10 SOL',
    tercescrowUsd: '$10,000,000',
    yellowCardBalance: '2 SOL',
    yellowCardUsd: '$2,000,000',
    tatumBalance: '5 SOL',
    tatumUsd: '$5,000,000',
    address: 'sol1example123456789',
  },
];

/** Transactions per asset (and optionally per wallet). Key: assetSymbol */
export const ASSET_TRANSACTIONS: Record<string, WalletTransaction[]> = {
  BTC: [
    { id: '1', to: 'Alucard', status: 'successful', type: 'Crypto Send', wallet: 'Master Wallet', amount: '0.01BTC / $20,000', date: 'Nov 6, 2024', assetSymbol: 'BTC', walletId: 'tercescrow' },
    { id: '2', to: 'Adam', status: 'pending', type: 'Crypto Send', wallet: 'Master Wallet', amount: '0.01BTC / $20,000', date: 'Nov 6, 2024', assetSymbol: 'BTC', walletId: 'tercescrow' },
    { id: '3', to: 'Sasha', status: 'failed', type: 'Crypto Send', wallet: 'Master Wallet', amount: '0.01BTC / $20,000', date: 'Nov 6, 2024', assetSymbol: 'BTC', walletId: 'tercescrow' },
  ],
  USDT: [
    { id: '4', to: 'John', status: 'successful', type: 'Crypto Send', wallet: 'Master Wallet', amount: '100 USDT / $100', date: 'Nov 5, 2024', assetSymbol: 'USDT', walletId: 'tercescrow' },
  ],
  ETH: [
    { id: '5', to: 'Charles Adam', status: 'successful', type: 'Crypto Send', wallet: 'Master Wallet', amount: '0.0023 ETH / $25,000', date: 'Nov 7, 2024', assetSymbol: 'ETH', walletId: 'tercescrow' },
  ],
  SOL: [
    { id: '6', to: 'Jane', status: 'pending', type: 'Crypto Send', wallet: 'Tatum Wallet', amount: '1 SOL / $200', date: 'Nov 6, 2024', assetSymbol: 'SOL', walletId: 'tercescrow' },
  ],
};

export function getTransactionsForAsset(assetSymbol: string, walletId?: WalletId): WalletTransaction[] {
  const list = ASSET_TRANSACTIONS[assetSymbol] ?? [];
  if (walletId) return list.filter((t) => t.walletId === walletId);
  return list;
}

/** For Wallet Assets modal: same list for all wallets; balance/usdValue reflect selected wallet when walletId provided */
export function getAssetsForWalletAssetsModal(_walletId?: WalletId): Array<
  Pick<WalletAssetItem, 'symbol' | 'name' | 'address'> & { balance: string; usdValue: string; iconUrl?: string }
> {
  return WALLET_ASSETS.map((a) => ({
    symbol: a.symbol,
    name: a.name,
    address: a.address,
    balance: a.tercescrowBalance,
    usdValue: a.tercescrowUsd,
  }));
}

export function getTableRows(): Array<{
  symbol: string;
  name: string;
  address: string;
  iconUrl?: string;
  masterBalance: string;
  masterUsd: string;
  yellowCard: string;
  yellowCardUsd: string;
  tatum: string;
  tatumUsd: string;
}> {
  return WALLET_ASSETS.map((a) => ({
    symbol: a.symbol,
    name: a.name,
    address: a.address,
    masterBalance: a.tercescrowBalance,
    masterUsd: a.tercescrowUsd,
    yellowCard: a.yellowCardBalance,
    yellowCardUsd: a.yellowCardUsd,
    tatum: a.tatumBalance,
    tatumUsd: a.tatumUsd,
  }));
}

export function getAssetBySymbol(symbol: string): WalletAssetItem | undefined {
  return WALLET_ASSETS.find((a) => a.symbol === symbol);
}
