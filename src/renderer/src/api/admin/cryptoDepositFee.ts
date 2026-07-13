import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

function unwrap<T>(res: unknown): T {
  const r = res as Record<string, unknown> | null | undefined;
  if (r && typeof r === 'object' && 'data' in r && r.data !== undefined) return r.data as T;
  return res as T;
}

export type DepositFeeWalletCurrencyOption = {
  id: number;
  currency: string;
  blockchain: string;
  symbol: string;
  displayLabel: string;
  isToken: boolean;
  feePercent: number | null;
};

export type DepositFeeRule = {
  walletCurrencyId: number;
  feePercent: number;
  displayLabel: string;
};

export type CryptoDepositFeeConfig = {
  isActive: boolean;
  currencies: DepositFeeWalletCurrencyOption[];
  configuredRules: DepositFeeRule[];
  updatedAt: string;
};

export async function getCryptoDepositFeeConfig(token: string): Promise<CryptoDepositFeeConfig> {
  const res = await apiCall(API_ENDPOINT.ADMIN.cryptoDepositFee, 'GET', undefined, token);
  return unwrap<CryptoDepositFeeConfig>(res);
}

export async function updateCryptoDepositFeeConfig(
  token: string,
  body: {
    isActive?: boolean;
    rules: Array<{ walletCurrencyId: number; feePercent: number }>;
  }
): Promise<CryptoDepositFeeConfig> {
  const res = await apiCall(API_ENDPOINT.ADMIN.cryptoDepositFee, 'PUT', body, token);
  return unwrap<CryptoDepositFeeConfig>(res);
}
