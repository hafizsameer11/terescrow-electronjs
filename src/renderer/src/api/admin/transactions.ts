import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';
import { listBushaTrades, type BushaTrade } from './busha';

/**
 * Backend `niche` values map to frontend page routes:
 *   crypto      → /transactions/crypto  (Busha trades — live provider)
 *   giftcard    → /transactions/gift-card-buy | /transactions/gift-card-sell
 *   billpayment → /transactions/bill-payments
 *   naira       → /transactions/naira
 */
export type TransactionNiche = 'crypto' | 'giftcard' | 'billpayment' | 'naira';
export type TransactionBuySell = 'buy' | 'sell';

export interface AdminTransactionsParams {
  token: string;
  niche?: TransactionNiche;
  type?: TransactionBuySell;
  status?: 'successful' | 'pending' | 'declined';
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

function normalizeBushaStatus(status?: string | null, bushaStatus?: string | null): string {
  const s = String(status || bushaStatus || '').toLowerCase();
  if (
    ['successful', 'completed', 'wallet_credited', 'funds_delivered', 'funds_converted', 'funds_received'].includes(s)
  ) {
    return 'successful';
  }
  if (['failed', 'cancelled', 'canceled', 'busha_failed', 'buy_reversed', 'refunded', 'funds_refunded'].includes(s)) {
    return 'declined';
  }
  if (['pending', 'processing', 'awaiting_payment', 'awaiting_deposit', 'settling'].includes(s)) {
    return 'pending';
  }
  return s || 'pending';
}

function mapBushaSide(side?: string | null): { title: string; Type: 'buy' | 'sell'; side: string } {
  const s = String(side || '').toLowerCase();
  if (s === 'buy') return { title: 'Buy Crypto', Type: 'buy', side: s };
  if (s === 'sell') return { title: 'Sell Crypto', Type: 'sell', side: s };
  if (s === 'receive' || s === 'cryptorecv') return { title: 'Receive Crypto', Type: 'buy', side: 'receive' };
  if (s === 'send' || s === 'cryptosend') return { title: 'Send Crypto', Type: 'sell', side: 'send' };
  if (s === 'convert' || s === 'swap') return { title: 'Swap Crypto', Type: 'buy', side: 'convert' };
  return { title: 'Crypto', Type: 'buy', side: s || 'trade' };
}

function mapBushaTradeToUnified(t: BushaTrade): any {
  const sideInfo = mapBushaSide(t.side);
  const source = String(t.sourceCurrency || '').toUpperCase();
  const target = String(t.targetCurrency || '').toUpperCase();
  const sourceAmount = Number(t.sourceAmount || 0);
  const targetAmount = t.targetAmount != null ? Number(t.targetAmount) : 0;

  let amount = sourceAmount;
  let amountNaira = 0;
  if (sideInfo.side === 'buy') {
    amount = targetAmount || sourceAmount;
    amountNaira = source === 'NGN' ? sourceAmount : 0;
  } else if (sideInfo.side === 'sell') {
    amount = sourceAmount;
    amountNaira = target === 'NGN' ? targetAmount : 0;
  }

  const pairTitle =
    sideInfo.side === 'convert'
      ? `${source}→${target}`
      : sideInfo.side === 'buy'
        ? target || source
        : source || target;

  const markupRaw = (t as any).providerResponse?.markup || null;
  const adminMarkupNgn = markupRaw ? Number(markupRaw.platformSpreadNgn || 0) : 0;
  const actualAmountNgn = markupRaw
    ? Number(markupRaw.bushaSourceAmount || markupRaw.bushaTargetAmount || 0)
    : 0;
  const userAmountNgn = markupRaw
    ? Number(markupRaw.userSourceAmount || markupRaw.userCreditNgn || markupRaw.userTargetAmount || 0)
    : 0;
  const markupPercent = markupRaw
    ? Number(markupRaw.buyMarkupPercent ?? markupRaw.sellMarkupPercent ?? 0)
    : 0;

  const user = t.user
    ? {
        id: t.user.id,
        username: t.user.username,
        firstname: t.user.firstname,
        lastname: t.user.lastname,
        profilePicture: t.user.profilePicture ?? null,
        country: t.user.country ?? '',
      }
    : t.customer
      ? {
          id: 0,
          username: t.customer.email?.split('@')[0] || t.customer.email || 'user',
          firstname: t.customer.firstName || '',
          lastname: t.customer.lastName || '',
          profilePicture: null,
          country: '',
        }
      : null;

  return {
    id: t.id,
    transactionId: t.bushaTransferId || t.id,
    status: normalizeBushaStatus(t.status, t.bushaStatus),
    amount,
    amountNaira,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt || t.createdAt,
    profit: Math.round(adminMarkupNgn * 100) / 100,
    department: { id: 0, title: sideInfo.title, niche: 'crypto', Type: sideInfo.Type },
    category: {
      id: 0,
      title: pairTitle,
      subTitle: `${source} → ${target}`,
      image: null,
    },
    subCategory: null,
    customer: user,
    agent: null,
    fromAddress: t.cryptoDepositAddress ?? null,
    toAddress: null,
    cardType: null,
    cardNumber: null,
    giftCardSubType: null,
    giftCardProvider: null,
    billType: null,
    billReference: null,
    billProvider: null,
    nairaType: null,
    nairaChannel: null,
    nairaReference: null,
    provider: 'busha',
    side: sideInfo.side,
    sourceCurrency: source,
    targetCurrency: target,
    sourceAmount,
    targetAmount: targetAmount || null,
    markup: markupRaw
      ? {
          markupPercent,
          actualAmountNgn: Math.round(actualAmountNgn * 100) / 100,
          userAmountNgn: Math.round(userAmountNgn * 100) / 100,
          adminMarkupNgn: Math.round(adminMarkupNgn * 100) / 100,
        }
      : null,
  };
}

function filterBushaTrades(
  trades: BushaTrade[],
  opts: {
    type?: TransactionBuySell;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }
): BushaTrade[] {
  let rows = [...trades];

  if (opts.type === 'buy') {
    rows = rows.filter((t) => ['buy', 'receive', 'cryptorecv', 'convert', 'swap'].includes(String(t.side || '').toLowerCase()));
  } else if (opts.type === 'sell') {
    rows = rows.filter((t) => ['sell', 'send', 'cryptosend'].includes(String(t.side || '').toLowerCase()));
  }

  if (opts.status) {
    rows = rows.filter((t) => normalizeBushaStatus(t.status, t.bushaStatus) === opts.status);
  }

  if (opts.startDate || opts.endDate) {
    const start = opts.startDate ? new Date(opts.startDate) : null;
    const end = opts.endDate ? new Date(opts.endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);
    rows = rows.filter((t) => {
      const d = new Date(t.createdAt).getTime();
      if (start && d < start.getTime()) return false;
      if (end && d > end.getTime()) return false;
      return true;
    });
  }

  if (opts.search?.trim()) {
    const q = opts.search.trim().toLowerCase();
    rows = rows.filter((t) => {
      const hay = [
        t.id,
        t.bushaTransferId,
        t.sourceCurrency,
        t.targetCurrency,
        t.side,
        t.user?.username,
        t.user?.firstname,
        t.user?.lastname,
        t.customer?.email,
        t.customer?.firstName,
        t.customer?.lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }

  return rows;
}

/** Crypto niche: always load from Busha trades API (live provider), not legacy CryptoTransaction. */
async function getBushaCryptoTransactions(params: AdminTransactionsParams) {
  const { token, type, status, startDate, endDate, search, page = 1, limit = 20 } = params;
  const trades = await listBushaTrades(token, 200);
  const filtered = filterBushaTrades(trades, { type, status, startDate, endDate, search });
  const total = filtered.length;
  const skip = (Math.max(1, page) - 1) * limit;
  const slice = filtered.slice(skip, skip + limit);
  return {
    transactions: slice.map(mapBushaTradeToUnified),
    total,
    page: Math.max(1, page),
    limit,
    totalPages: Math.ceil(total / limit) || 0,
  };
}

export async function getAdminTransactions(params: AdminTransactionsParams): Promise<{
  transactions: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { token, niche, type, status, startDate, endDate, search, page = 1, limit = 20 } = params;

  // Crypto tab must show BushaTradeLog — do not rely on unified /transactions?niche=crypto
  // (production may still be on legacy CryptoTransaction until redeploy).
  if (niche === 'crypto') {
    try {
      return await getBushaCryptoTransactions(params);
    } catch (err) {
      console.error('[admin transactions] Busha trades fetch failed, falling back to unified API', err);
    }
  }

  const sp = new URLSearchParams();
  if (niche) sp.set('niche', niche);
  if (type) sp.set('type', type);
  if (status) sp.set('status', status);
  if (startDate) sp.set('startDate', startDate);
  if (endDate) sp.set('endDate', endDate);
  if (search) sp.set('search', search);
  sp.set('page', String(page));
  sp.set('limit', String(limit));
  const url = `${API_ENDPOINT.ADMIN.transactions}?${sp}`;
  const res = await apiCall(url, 'GET', undefined, token);
  const data = (res as any)?.data ?? { transactions: [], total: 0, page: 1, limit: 20, totalPages: 0 };

  // If "All" tab returns crypto rows without provider, they are legacy — leave as-is for other niches
  return data;
}

export async function getAdminTransactionsByCustomer(
  token: string,
  customerId: string | number,
  params?: Omit<AdminTransactionsParams, 'token'>
): Promise<{
  transactions: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  if (params?.niche === 'crypto') {
    try {
      const all = await getBushaCryptoTransactions({ token, ...params });
      const cid = Number(customerId);
      const filtered = all.transactions.filter((t: any) => t.customer?.id === cid);
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 20;
      const skip = (page - 1) * limit;
      return {
        transactions: filtered.slice(skip, skip + limit),
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit) || 0,
      };
    } catch {
      /* fall through */
    }
  }

  const sp = new URLSearchParams();
  if (params?.niche) sp.set('niche', params.niche);
  if (params?.type) sp.set('type', params.type);
  if (params?.status) sp.set('status', params.status);
  if (params?.startDate) sp.set('startDate', params.startDate);
  if (params?.endDate) sp.set('endDate', params.endDate);
  if (params?.search) sp.set('search', params.search);
  sp.set('page', String(params?.page ?? 1));
  sp.set('limit', String(params?.limit ?? 20));
  const url = `${API_ENDPOINT.ADMIN.transactionsByCustomer(customerId)}?${sp}`;
  const res = await apiCall(url, 'GET', undefined, token);
  return (res as any)?.data ?? { transactions: [], total: 0, page: 1, limit: 20, totalPages: 0 };
}

export async function revokeCryptoTransaction(
  token: string,
  transactionId: string,
  reason?: string
): Promise<{ alreadyRevoked?: boolean; transactionId: string; status: string }> {
  const url = API_ENDPOINT.ADMIN.revokeCryptoTransaction(transactionId);
  const res = await apiCall(url, 'POST', reason ? { reason } : {}, token);
  return (res as any)?.data ?? res;
}

export async function getAdminTransactionStats(
  token: string,
  params?: { niche?: TransactionNiche; startDate?: string; endDate?: string }
): Promise<any> {
  // Prefer live Busha trade counts for crypto stats card
  let bushaCryptoStats: any = null;
  try {
    const trades = await listBushaTrades(token, 200);
    const filtered = filterBushaTrades(trades, {
      startDate: params?.startDate,
      endDate: params?.endDate,
    });
    let sumUsd = 0;
    let sumNaira = 0;
    for (const t of filtered) {
      const side = String(t.side || '').toLowerCase();
      const source = String(t.sourceCurrency || '').toUpperCase();
      const target = String(t.targetCurrency || '').toUpperCase();
      const sourceAmount = Number(t.sourceAmount || 0);
      const targetAmount = t.targetAmount != null ? Number(t.targetAmount) : 0;
      if (side === 'buy') {
        sumUsd += targetAmount || sourceAmount;
        if (source === 'NGN') sumNaira += sourceAmount;
      } else if (side === 'sell') {
        sumUsd += sourceAmount;
        if (target === 'NGN') sumNaira += targetAmount;
      } else {
        sumUsd += sourceAmount;
      }
    }
    bushaCryptoStats = {
      _count: filtered.length,
      _sum: { amount: sumUsd, amountNaira: sumNaira },
      change: 'positive',
      percentage: 0,
    };
  } catch {
    /* ignore — fall back to unified stats */
  }

  const sp = new URLSearchParams();
  if (params?.niche) sp.set('niche', params.niche);
  if (params?.startDate) sp.set('startDate', params.startDate);
  if (params?.endDate) sp.set('endDate', params.endDate);
  const url = sp.toString() ? `${API_ENDPOINT.ADMIN.transactionStats}?${sp}` : API_ENDPOINT.ADMIN.transactionStats;
  const res = await apiCall(url, 'GET', undefined, token);
  const data = (res as any)?.data ?? {};
  if (bushaCryptoStats) {
    return { ...data, cryptoTransactions: bushaCryptoStats };
  }
  return data;
}
