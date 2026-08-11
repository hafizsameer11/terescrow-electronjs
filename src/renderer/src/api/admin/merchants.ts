import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

export type PalmPayMerchantBalance = {
  availableBalanceNgn: number;
  frozenBalanceNgn: number;
  currentBalanceNgn: number;
  unSettleBalanceNgn: number;
  merchantId: string;
};

export type StroWalletBalanceResult = {
  currency: 'NGN' | 'USD';
  balance: number | null;
  raw?: unknown;
};

export type MerchantTopupLog = {
  id: string;
  amount: string;
  currency: string;
  status: string;
  palmpayOrderId?: string | null;
  palmpayOrderNo?: string | null;
  bankCode: string;
  bankName?: string | null;
  accountNumber: string;
  accountName?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  completedAt?: string | null;
  initiatedBy?: { id: number; firstname: string; lastname: string; email: string };
};

export type MerchantsOverview = {
  palmpay: {
    id: string;
    name: string;
    configured: boolean;
    environment?: string;
    merchantId?: string | null;
    appId?: string | null;
    baseUrl?: string;
    balance: PalmPayMerchantBalance | null;
    balanceError?: string | null;
  };
  strowallet: {
    id: string;
    name: string;
    configured: boolean;
    isActive: boolean;
    credentialsSource?: string;
    publicKeyMasked?: string | null;
    secretKeyMasked?: string | null;
    hasSecretKey?: boolean;
    merchantId?: string | null;
    websiteUrl?: string | null;
    baseUrl?: string;
    topupBank?: {
      bankCode?: string | null;
      bankName?: string | null;
      accountNumber?: string | null;
      accountName?: string | null;
    } | null;
    balanceNgn?: StroWalletBalanceResult | null;
    balanceUsd?: StroWalletBalanceResult | null;
    balanceError?: string | null;
    recentTopups: MerchantTopupLog[];
  };
};

export type StroWalletTopupSettingsForm = {
  topupBankCode?: string;
  topupBankName?: string;
  topupAccountNumber?: string;
  topupAccountName?: string;
  isActive?: boolean;
};

export type StroWalletSettingsResponse = StroWalletTopupSettingsForm & {
  configured: boolean;
  publicKeyMasked?: string | null;
  secretKeyMasked?: string | null;
  hasSecretKey?: boolean;
  merchantId?: string | null;
  websiteUrl?: string | null;
  baseUrl?: string;
  envKeys?: Record<string, string>;
};

export type PalmPayBank = {
  bankCode: string;
  bankName: string;
};

function unwrap<T>(res: unknown): T {
  return (res as { data?: T })?.data as T;
}

export async function getMerchantsOverview(token: string): Promise<MerchantsOverview> {
  const res = await apiCall(API_ENDPOINT.ADMIN.merchants, 'GET', undefined, token);
  return unwrap<MerchantsOverview>(res);
}

export async function getStroWalletSettings(token: string): Promise<StroWalletSettingsResponse> {
  const res = await apiCall(API_ENDPOINT.ADMIN.strowalletConfig, 'GET', undefined, token);
  return unwrap(res);
}

export async function saveStroWalletTopupSettings(token: string, payload: StroWalletTopupSettingsForm) {
  const res = await apiCall(API_ENDPOINT.ADMIN.strowalletConfig, 'PUT', payload, token);
  return unwrap(res);
}

/** @deprecated use getStroWalletSettings */
export const getStroWalletConfig = getStroWalletSettings;
/** @deprecated use saveStroWalletTopupSettings */
export const saveStroWalletConfig = saveStroWalletTopupSettings;

export async function topUpStroWallet(
  token: string,
  payload: { amount: number; bankCode?: string; accountNumber?: string; accountName?: string; bankName?: string }
) {
  const res = await apiCall(API_ENDPOINT.ADMIN.strowalletTopup, 'POST', payload, token);
  return unwrap(res);
}

export async function getPalmpayBanks(token: string): Promise<PalmPayBank[]> {
  const res = await apiCall(API_ENDPOINT.ADMIN.merchantsPalmpayBanks, 'GET', undefined, token);
  const data = unwrap<unknown>(res);
  if (Array.isArray(data)) return data as PalmPayBank[];
  if (data && typeof data === 'object' && Array.isArray((data as { banks?: PalmPayBank[] }).banks)) {
    return (data as { banks: PalmPayBank[] }).banks;
  }
  return [];
}

export async function verifyPalmpayBankAccount(
  token: string,
  payload: { bankCode: string; accountNumber: string }
): Promise<{ accountName?: string; isValid: boolean; errorMessage?: string }> {
  const res = await apiCall(API_ENDPOINT.ADMIN.merchantsPalmpayVerifyAccount, 'POST', payload, token);
  return unwrap(res);
}
