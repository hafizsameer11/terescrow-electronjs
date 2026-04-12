/**
 * Frontend dataset for Referrals. Replace with API later.
 */

export interface ReferralRow {
  id: string;
  name: string;
  email: string;
  joined: string;
  noOfReferrals: number;
  downlineReferrals: number;
  amountEarned: string;
}

export interface ReferralSummary {
  allUsers: number;
  allUsersTrend?: string;
  totalReferred: number;
  amountPaidOut: string;
}

export interface EarnSettings {
  firstTimeDepositBonusPct: number;
  commissionReferralTradesPct: number;
  commissionDownlineTradesPct: number;
}

export interface ReferralByUserStats {
  giftCardBuy: string;
  giftCardSell: string;
  cryptoTrades: string;
  noOfUsersReferred: number;
}

export interface ReferralByUserEarned {
  amountEarnedFromTrades: string;
  fromGcTrades: string;
  fromCryptoTrades: string;
  fromDownlines: string;
}

export interface ReferralByUser {
  referredName: string;
  referredAvatar?: string;
  referredAt: string;
  stats: ReferralByUserStats;
  earned: ReferralByUserEarned;
}

export type ReferralTypeFilter = 'All' | 'General %' | 'Custom %';

const MOCK_REFERRAL_ROWS: ReferralRow[] = [
  { id: '1', name: 'Qamardeen Abdulmalik', email: 'abcdefgh@gmail.com', joined: 'Nov7, 2024', noOfReferrals: 10, downlineReferrals: 24, amountEarned: 'N10,000' },
  { id: '2', name: 'Chris Adewale', email: 'chris@example.com', joined: 'Nov5, 2024', noOfReferrals: 5, downlineReferrals: 12, amountEarned: 'N5,000' },
  { id: '3', name: 'Collins Ola', email: 'collins@example.com', joined: 'Nov3, 2024', noOfReferrals: 3, downlineReferrals: 8, amountEarned: 'N3,000' },
  { id: '4', name: 'Tolu Obi', email: 'tolu@example.com', joined: 'Oct28, 2024', noOfReferrals: 7, downlineReferrals: 15, amountEarned: 'N7,500' },
  { id: '5', name: 'Ngozi Akidele', email: 'ngozi@example.com', joined: 'Oct20, 2024', noOfReferrals: 2, downlineReferrals: 4, amountEarned: 'N2,000' },
  { id: '6', name: 'Dayo Musa', email: 'dayo@example.com', joined: 'Oct15, 2024', noOfReferrals: 4, downlineReferrals: 9, amountEarned: 'N4,000' },
];

const MOCK_SUMMARY: ReferralSummary = {
  allUsers: 150,
  allUsersTrend: '↑15%',
  totalReferred: 100,
  amountPaidOut: 'N80,000',
};

let earnSettings: EarnSettings = {
  firstTimeDepositBonusPct: 100,
  commissionReferralTradesPct: 5,
  commissionDownlineTradesPct: 2,
};

const MOCK_REFERRALS_BY_USER: Record<string, ReferralByUser[]> = {
  'Qamardeen Abdulmalik': [
    {
      referredName: 'Chris Adewale',
      referredAt: 'June 16, 2025 - 07:22 AM',
      stats: {
        giftCardBuy: 'N10,000',
        giftCardSell: 'N20,000',
        cryptoTrades: 'N20,000',
        noOfUsersReferred: 10,
      },
      earned: {
        amountEarnedFromTrades: 'N20,000',
        fromGcTrades: 'N10,000',
        fromCryptoTrades: 'N10,000',
        fromDownlines: 'N20,000',
      },
    },
    {
      referredName: 'Collins Ola',
      referredAt: 'June 16, 2025 - 07:22 AM',
      stats: { giftCardBuy: 'N5,000', giftCardSell: 'N8,000', cryptoTrades: 'N12,000', noOfUsersReferred: 3 },
      earned: { amountEarnedFromTrades: 'N8,000', fromGcTrades: 'N4,000', fromCryptoTrades: 'N4,000', fromDownlines: 'N6,000' },
    },
    {
      referredName: 'Tolu Obi',
      referredAt: 'June 16, 2025 - 07:22 AM',
      stats: { giftCardBuy: 'N15,000', giftCardSell: 'N10,000', cryptoTrades: 'N25,000', noOfUsersReferred: 5 },
      earned: { amountEarnedFromTrades: 'N15,000', fromGcTrades: 'N7,500', fromCryptoTrades: 'N7,500', fromDownlines: 'N10,000' },
    },
    {
      referredName: 'Ngozi Akidele',
      referredAt: 'June 16, 2025 - 07:22 AM',
      stats: { giftCardBuy: 'N3,000', giftCardSell: 'N4,000', cryptoTrades: 'N5,000', noOfUsersReferred: 1 },
      earned: { amountEarnedFromTrades: 'N2,500', fromGcTrades: 'N1,500', fromCryptoTrades: 'N1,000', fromDownlines: 'N1,000' },
    },
    {
      referredName: 'Dayo Musa',
      referredAt: 'June 16, 2025 - 07:22 AM',
      stats: { giftCardBuy: 'N8,000', giftCardSell: 'N6,000', cryptoTrades: 'N14,000', noOfUsersReferred: 4 },
      earned: { amountEarnedFromTrades: 'N9,000', fromGcTrades: 'N4,500', fromCryptoTrades: 'N4,500', fromDownlines: 'N5,000' },
    },
  ],
};

export function getReferralSummary(): ReferralSummary {
  return { ...MOCK_SUMMARY };
}

export function getReferralList(filters: {
  type?: ReferralTypeFilter;
  search?: string;
  startDate?: string;
  endDate?: string;
}): ReferralRow[] {
  let list = [...MOCK_REFERRAL_ROWS];
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
    );
  }
  return list;
}

export function getEarnSettings(): EarnSettings {
  return { ...earnSettings };
}

export function setEarnSettings(settings: EarnSettings): void {
  earnSettings = { ...settings };
}

export function getReferralsByUser(userName: string): ReferralByUser[] {
  return MOCK_REFERRALS_BY_USER[userName] ?? [];
}
