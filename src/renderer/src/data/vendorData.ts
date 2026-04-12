/**
 * Frontend dataset for Send Vendors (network, currency, wallet address, name).
 * Used in Settings > Vendors and in Master Wallet Send modal. Replace with API later.
 */

export const VENDOR_NETWORKS = ['Ethereum', 'Avax', 'Base', 'Polygon', 'Arbitrum', 'Bitcoin', 'Solana', 'Tron'] as const;
export type VendorNetwork = (typeof VENDOR_NETWORKS)[number];

export const VENDOR_CURRENCIES = ['BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'TRX', 'AVAX', 'MATIC', 'Other'] as const;
export type VendorCurrency = (typeof VENDOR_CURRENCIES)[number];

export interface Vendor {
  id: string;
  name: string;
  network: VendorNetwork;
  currency: VendorCurrency;
  walletAddress: string;
  notes?: string;
  createdAt: string;
}

let vendorsList: Vendor[] = [
  {
    id: 'v1',
    name: 'Yellow Card Withdrawal',
    network: 'Ethereum',
    currency: 'USDT',
    walletAddress: '0x238fenwejcsniw9dicisndwincsnk',
    notes: 'Primary USDT payout',
    createdAt: '2024-11-01',
  },
  {
    id: 'v2',
    name: 'Liquidity Provider A',
    network: 'Base',
    currency: 'ETH',
    walletAddress: '0xbase1exampleabcdef123456',
    createdAt: '2024-11-05',
  },
  {
    id: 'v3',
    name: 'Cold Storage BTC',
    network: 'Bitcoin',
    currency: 'BTC',
    walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    createdAt: '2024-10-15',
  },
];

let nextId = 4;

export function getVendors(): Vendor[] {
  return [...vendorsList];
}

export function getVendorsForCurrency(symbol: string): Vendor[] {
  return vendorsList.filter((v) => v.currency.toUpperCase() === symbol.toUpperCase());
}

export function getVendorById(id: string): Vendor | undefined {
  return vendorsList.find((v) => v.id === id);
}

export function addVendor(data: Omit<Vendor, 'id' | 'createdAt'>): Vendor {
  const created: Vendor = {
    ...data,
    id: `v${nextId++}`,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  vendorsList.push(created);
  return created;
}

export function updateVendor(id: string, data: Partial<Omit<Vendor, 'id' | 'createdAt'>>): Vendor | undefined {
  const i = vendorsList.findIndex((v) => v.id === id);
  if (i === -1) return undefined;
  vendorsList[i] = { ...vendorsList[i], ...data };
  return vendorsList[i];
}

export function deleteVendor(id: string): boolean {
  const i = vendorsList.findIndex((v) => v.id === id);
  if (i === -1) return false;
  vendorsList.splice(i, 1);
  return true;
}
