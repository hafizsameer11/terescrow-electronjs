import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

export interface ReferralsListParams {
  token: string;
  type?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export async function getReferralsSummary(
  token: string,
  params?: { startDate?: string; endDate?: string }
): Promise<{ allUsers: number; allUsersTrend?: string; totalReferred: number; amountPaidOut: string }> {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  const url = searchParams.toString() ? `${API_ENDPOINT.ADMIN.referralsSummary}?${searchParams}` : API_ENDPOINT.ADMIN.referralsSummary;
  const res = await apiCall(url, 'GET', undefined, token);
  return (res as any)?.data ?? { allUsers: 0, totalReferred: 0, amountPaidOut: 'N0' };
}

export async function getReferralsList(params: ReferralsListParams): Promise<{
  rows: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { token, type, search, startDate, endDate, page = 1, limit = 20 } = params;
  const searchParams = new URLSearchParams();
  if (type) searchParams.set('type', type);
  if (search) searchParams.set('search', search);
  if (startDate) searchParams.set('startDate', startDate);
  if (endDate) searchParams.set('endDate', endDate);
  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));
  const url = `${API_ENDPOINT.ADMIN.referrals}?${searchParams.toString()}`;
  const res = await apiCall(url, 'GET', undefined, token);
  const data = (res as any)?.data;
  return data ?? { rows: [], total: 0, page: 1, limit: 20, totalPages: 0 };
}

export async function getReferralsByUser(token: string, userId: string | number): Promise<any[]> {
  const res = await apiCall(API_ENDPOINT.ADMIN.referralsByUser(userId), 'GET', undefined, token);
  const data = (res as any)?.data;
  return data?.referrals ?? data ?? [];
}

export async function getReferralsEarnSettings(token: string): Promise<{
  firstTimeDepositBonusPct: number;
  commissionReferralTradesPct: number;
  commissionDownlineTradesPct: number;
}> {
  const res = await apiCall(API_ENDPOINT.ADMIN.referralsEarnSettings, 'GET', undefined, token);
  return (res as any)?.data ?? { firstTimeDepositBonusPct: 100, commissionReferralTradesPct: 5, commissionDownlineTradesPct: 2 };
}

export async function updateReferralsEarnSettings(
  token: string,
  body: { firstTimeDepositBonusPct: number; commissionReferralTradesPct: number; commissionDownlineTradesPct: number }
): Promise<unknown> {
  const res = await apiCall(API_ENDPOINT.ADMIN.referralsEarnSettings, 'PUT', body, token);
  return (res as any)?.data;
}

export type ReferralService =
  | 'BILL_PAYMENT'
  | 'GIFT_CARD_BUY'
  | 'GIFT_CARD_SELL'
  | 'CRYPTO_BUY'
  | 'CRYPTO_SELL';

export const REFERRAL_SERVICES: ReferralService[] = [
  'BILL_PAYMENT',
  'GIFT_CARD_BUY',
  'GIFT_CARD_SELL',
  'CRYPTO_BUY',
  'CRYPTO_SELL',
];

export interface CommissionSettingRow {
  service: ReferralService;
  commissionType: 'PERCENTAGE' | 'FIXED';
  commissionValue: number;
  level2Pct: number;
  signupBonus: number;
  minFirstWithdrawal: number;
  isActive: boolean;
}

export interface UserReferralOverrideRow {
  id?: number;
  userId?: number;
  service: ReferralService;
  commissionType: 'PERCENTAGE' | 'FIXED';
  commissionValue: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function getReferralsCommissionSettings(token: string): Promise<CommissionSettingRow[]> {
  const res = await apiCall(API_ENDPOINT.ADMIN.referralsCommissionSettings, 'GET', undefined, token);
  const data = (res as any)?.data;
  return Array.isArray(data) ? data : [];
}

export async function updateReferralsCommissionSettings(
  token: string,
  body: {
    service: ReferralService;
    commissionType: 'PERCENTAGE' | 'FIXED';
    commissionValue: number;
    level2Pct?: number;
    signupBonus?: number;
    minFirstWithdrawal?: number;
    isActive?: boolean;
  }
): Promise<unknown> {
  const res = await apiCall(API_ENDPOINT.ADMIN.referralsCommissionSettings, 'PUT', body, token);
  return (res as any)?.data;
}

export async function getReferralsUserOverrides(
  token: string,
  userId: string | number
): Promise<UserReferralOverrideRow[]> {
  const res = await apiCall(API_ENDPOINT.ADMIN.referralsUserOverride(userId), 'GET', undefined, token);
  const data = (res as any)?.data;
  if (Array.isArray(data)) return data as UserReferralOverrideRow[];
  if (Array.isArray((data as any)?.items)) return (data as any).items as UserReferralOverrideRow[];
  if (Array.isArray((data as any)?.overrides)) return (data as any).overrides as UserReferralOverrideRow[];
  return [];
}

export async function upsertReferralsUserOverride(
  token: string,
  userId: string | number,
  body: {
    service: ReferralService;
    commissionType: 'PERCENTAGE' | 'FIXED';
    commissionValue: number;
  }
): Promise<UserReferralOverrideRow | unknown> {
  const res = await apiCall(API_ENDPOINT.ADMIN.referralsUserOverride(userId), 'PUT', body, token);
  return (res as any)?.data;
}

export async function deleteReferralsUserOverride(
  token: string,
  userId: string | number,
  service: ReferralService
): Promise<unknown> {
  const res = await apiCall(API_ENDPOINT.ADMIN.referralsUserOverrideByService(userId, service), 'DELETE', undefined, token);
  return (res as any)?.data;
}
