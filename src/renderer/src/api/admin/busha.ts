import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

function unwrap<T>(res: unknown): T {
  return (res as { data?: T })?.data as T;
}

export type BushaStatus = {
  busha: {
    configured: boolean;
    environment: string;
    baseUrl: string;
    apiKeyMasked?: string | null;
  };
  palmpay: {
    configured: boolean;
    balance: {
      availableBalanceNgn: number;
      currentBalanceNgn: number;
    } | null;
    balanceError?: string | null;
  };
  settings: {
    payoutBankCode?: string | null;
    payoutBankName?: string | null;
    payoutAccountNumber?: string | null;
    payoutAccountName?: string | null;
    payoutRecipientId?: string | null;
    isActive?: boolean;
  } | null;
  stats: { customerCount: number; tradeCount: number };
  currencies: {
    fiat: string[];
    crypto: string[];
    networks: Record<string, string>;
  };
  recentTrades: BushaTrade[];
};

export type BushaCustomer = {
  id: string;
  bushaProfileId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  countryId: string;
  status: string;
  createdAt: string;
  _count?: { trades: number };
};

export type BushaTrade = {
  id: string;
  side: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: string;
  targetAmount?: string | null;
  bushaQuoteId?: string | null;
  bushaTransferId?: string | null;
  bushaStatus?: string | null;
  palmpayOrderId?: string | null;
  palmpayOrderNo?: string | null;
  palmpayStatus?: string | null;
  payInBankCode?: string | null;
  payInBankName?: string | null;
  payInAccountNumber?: string | null;
  payInAccountName?: string | null;
  payInExpiresAt?: string | null;
  cryptoDepositAddress?: string | null;
  cryptoDepositNetwork?: string | null;
  status: string;
  errorMessage?: string | null;
  createdAt: string;
  completedAt?: string | null;
  customer?: {
    email: string;
    firstName: string;
    lastName: string;
    bushaProfileId: string;
  };
};

export type BushaQuotePreview = {
  quote: {
    id: string;
    source_currency: string;
    target_currency: string;
    source_amount: string;
    target_amount: string;
    expires_at?: string;
    rate?: Record<string, unknown>;
    fees?: unknown[];
  };
  customer: BushaCustomer;
};

const base = API_ENDPOINT.ADMIN.busha;

export async function getBushaStatus(token: string): Promise<BushaStatus> {
  const res = await apiCall(base + '/status', 'GET', undefined, token);
  return unwrap(res);
}

export async function saveBushaSettings(
  token: string,
  payload: {
    payoutBankCode?: string;
    payoutBankName?: string;
    payoutAccountNumber?: string;
    payoutAccountName?: string;
    payoutRecipientId?: string;
    isActive?: boolean;
  }
) {
  const res = await apiCall(base + '/settings', 'PUT', payload, token);
  return unwrap(res);
}

export async function syncBushaRecipient(token: string, profileId: string) {
  const res = await apiCall(base + '/recipients/sync', 'POST', { profileId }, token);
  return unwrap(res);
}

export async function listBushaCustomers(token: string): Promise<BushaCustomer[]> {
  const res = await apiCall(base + '/customers', 'GET', undefined, token);
  return unwrap(res);
}

export async function createBushaCustomer(
  token: string,
  payload: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    countryId?: string;
    birthDate?: string;
  }
) {
  const res = await apiCall(base + '/customers', 'POST', payload, token);
  return unwrap<BushaCustomer>(res);
}

export async function verifyBushaCustomer(token: string, customerId: string) {
  const res = await apiCall(base + `/customers/${customerId}/verify`, 'POST', {}, token);
  return unwrap(res);
}

export async function refreshBushaCustomer(token: string, customerId: string) {
  const res = await apiCall(base + `/customers/${customerId}/refresh`, 'POST', {}, token);
  return unwrap(res);
}

export async function previewBushaQuote(
  token: string,
  payload: {
    customerId: string;
    side: 'buy' | 'sell';
    sourceCurrency: string;
    targetCurrency: string;
    amount: string;
    amountField?: 'source' | 'target';
    fundingMethod?: 'temporary_bank_account' | 'balance' | 'address';
  }
): Promise<BushaQuotePreview> {
  const res = await apiCall(base + '/quote/preview', 'POST', payload, token);
  return unwrap(res);
}

export async function executeBushaBuy(
  token: string,
  payload: {
    customerId: string;
    sourceCurrency: string;
    targetCurrency: string;
    sourceAmount: string;
    autoPalmpayPayout?: boolean;
  }
) {
  const res = await apiCall(base + '/trades/buy', 'POST', payload, token);
  return unwrap<BushaTrade>(res);
}

export async function executeBushaSell(
  token: string,
  payload: {
    customerId: string;
    sourceCurrency: string;
    targetCurrency: string;
    sourceAmount: string;
    fundingMethod?: 'balance' | 'address';
  }
) {
  const res = await apiCall(base + '/trades/sell', 'POST', payload, token);
  return unwrap<BushaTrade>(res);
}

export async function listBushaTrades(token: string): Promise<BushaTrade[]> {
  const res = await apiCall(base + '/trades', 'GET', undefined, token);
  return unwrap(res);
}

export async function refreshBushaTrade(token: string, tradeId: string) {
  const res = await apiCall(base + `/trades/${tradeId}/refresh`, 'POST', {}, token);
  return unwrap<BushaTrade>(res);
}
