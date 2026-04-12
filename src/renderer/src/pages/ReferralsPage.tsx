import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiSearch } from 'react-icons/fi';
import { useAuth } from '@renderer/context/authContext';
import ReferralsByUserModal from '@renderer/components/modal/ReferralsByUserModal';
import EarnSettingsModal from '@renderer/components/modal/EarnSettingsModal';
import ReferralUserOverrideModal from '@renderer/components/modal/ReferralUserOverrideModal';
import ReferralCommissionSettings from '@renderer/components/referrals/ReferralCommissionSettings';
import {
  getReferralsSummary,
  getReferralsList,
  getReferralsByUser,
} from '@renderer/api/admin/referrals';
import { addThousandSeparator } from '@renderer/api/helper';
import type { ReferralByUser } from '@renderer/data/referralsData';

function formatDate(v: string | undefined): string {
  if (!v) return '—';
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return v;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return v; }
}
function formatAmount(v: any): string {
  if (v == null) return '—';
  if (typeof v === 'number') return 'N' + addThousandSeparator(v);
  return String(v);
}

export type ReferralTypeFilter = 'All' | 'General %' | 'Custom %';

export interface ReferralRow {
  id: string | number;
  name: string;
  email: string;
  joined?: string;
  noOfReferrals?: number;
  downlineReferrals?: number;
  amountEarned?: string;
  [key: string]: any;
}

const ReferralsPage: React.FC = () => {
  const { token } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [referralType, setReferralType] = useState<ReferralTypeFilter>('All');
  const [dropdownFilter, setDropdownFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [earnSettingsOpen, setEarnSettingsOpen] = useState(false);
  const [referralsByUserOpen, setReferralsByUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ReferralRow | null>(null);
  const [page, setPage] = useState(1);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideUser, setOverrideUser] = useState<ReferralRow | null>(null);

  const { data: summaryData } = useQuery({
    queryKey: ['admin-referrals-summary', token, startDate, endDate],
    queryFn: () =>
      getReferralsSummary(token!, { startDate: startDate || undefined, endDate: endDate || undefined }),
    enabled: !!token,
  });
  const summary = summaryData ?? { allUsers: 0, totalReferred: 0, amountPaidOut: 'N0' };

  const { data: listData } = useQuery({
    queryKey: ['admin-referrals-list', token, referralType, search, startDate, endDate, page],
    queryFn: () =>
      getReferralsList({
        token: token!,
        type: referralType === 'All' ? undefined : referralType,
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 20,
      }),
    enabled: !!token,
  });
  const list: ReferralRow[] = listData?.rows ?? [];

  const { data: referralsForModal = [] } = useQuery({
    queryKey: ['admin-referrals-by-user', token, selectedUser?.id],
    queryFn: () => getReferralsByUser(token!, selectedUser!.id),
    enabled: !!token && !!selectedUser && referralsByUserOpen,
  });

  const openReferralsByUser = (row: ReferralRow) => {
    setSelectedUser(row);
    setReferralsByUserOpen(true);
  };


  const openUserOverride = (row: ReferralRow) => {
    setOverrideUser(row);
    setOverrideOpen(true);
  };


  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[40px] font-normal text-gray-800">Referrals</h1>
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">Start Date</label>
            <input
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="dd/mm/yyyy"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-36"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-0.5">End Date</label>
            <input
              type="text"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="dd/mm/yyyy"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-36"
            />
          </div>
          <button
            onClick={() => setEarnSettingsOpen(true)}
            className="px-4 py-2 rounded-xl font-normal bg-white border border-gray-300 text-gray-800 mt-5"
          >
            Global earn %
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">All Users</p>
          <p className="text-2xl font-bold text-gray-800">{summary.allUsers}</p>
          {summary.allUsersTrend && <p className="text-sm text-green-600">{summary.allUsersTrend}</p>}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Total Referred</p>
          <p className="text-2xl font-bold text-gray-800">{summary.totalReferred}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Amount Paid Out</p>
          <p className="text-2xl font-bold text-gray-800">{formatAmount(summary.amountPaidOut)}</p>
        </div>
      </div>

      {token && <ReferralCommissionSettings token={token} />}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          {(['All', 'General %', 'Custom %'] as ReferralTypeFilter[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setReferralType(type)}
              className={`px-4 py-2 text-sm font-medium ${referralType === type ? 'bg-[#147341] text-white' : 'bg-white text-gray-700'}`}
            >
              {type}
            </button>
          ))}
        </div>
        <select
          value={dropdownFilter}
          onChange={(e) => setDropdownFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option>All</option>
        </select>
        <div className="relative flex-1 min-w-[160px]">
          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Users"
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">No of referrals</th>
                <th className="px-4 py-3">Downline Referrals</th>
                <th className="px-4 py-3">Amount Earned</th>
                <th className="px-4 py-3 w-40">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={String(row.id)} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800 font-medium">{row.name}</td>
                  <td className="px-4 py-3 text-gray-600">{row.email}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(row.joined ?? row.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-600">{row.noOfReferrals ?? row.referralCount ?? 0}</td>
                  <td className="px-4 py-3 text-gray-600">{row.downlineReferrals ?? row.downlineCount ?? 0}</td>
                  <td className="px-4 py-3 text-gray-600">{formatAmount(row.amountEarned ?? row.amountPaidOut)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openReferralsByUser(row)}
                        className="px-3 py-1.5 bg-[#0d5a2e] text-white text-sm font-medium rounded hover:bg-[#0a4722]"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => openUserOverride(row)}
                        className="px-3 py-1.5 border border-[#147341] text-[#147341] text-sm font-medium rounded hover:bg-[#147341]/10"
                      >
                        Edit %
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && (
          <p className="p-6 text-center text-gray-500">No referrals found.</p>
        )}
      </div>

      <ReferralsByUserModal
        isOpen={referralsByUserOpen}
        onClose={() => { setReferralsByUserOpen(false); setSelectedUser(null); }}
        userName={selectedUser?.name ?? ''}
        referrals={(referralsForModal as ReferralByUser[]) ?? []}
      />
      {token && overrideUser && (
        <ReferralUserOverrideModal
          isOpen={overrideOpen}
          onClose={() => { setOverrideOpen(false); setOverrideUser(null); }}
          token={token}
          userId={overrideUser.id}
          userName={overrideUser.name}
        />
      )}
      <EarnSettingsModal isOpen={earnSettingsOpen} onClose={() => setEarnSettingsOpen(false)} />
    </div>
  );
};

export default ReferralsPage;
