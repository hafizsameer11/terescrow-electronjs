import React, { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { FiSearch } from 'react-icons/fi';
import { useAuth } from '@renderer/context/authContext';
import {
  getAdminUserBalances,
  getAdminUserBalancesSummary,
  type AdminUserBalanceRow,
} from '@renderer/api/admin/userBalances';
import { addThousandSeparator } from '@renderer/api/helper';
import { apiDateParams, DATE_RANGE_PRESETS } from '@renderer/utils/dateRange';
import { useDebouncedValue } from '@renderer/utils/useDebouncedValue';
import ListFetchingIndicator from '@renderer/components/ListFetchingIndicator';
import UserWalletDetailModal from '@renderer/components/modal/UserWalletDetailModal';

type SortOrder = 'balance-desc' | 'balance-asc' | 'name-az' | 'name-za';
type BalanceCurrency = 'ngn' | 'usd';

const ORDER_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'balance-desc', label: 'Balance — highest first' },
  { value: 'balance-asc', label: 'Balance — lowest first' },
  { value: 'name-az', label: 'Name (A–Z)' },
  { value: 'name-za', label: 'Name (Z–A)' },
];

function fmtUsd(n: number) {
  return '$' + addThousandSeparator(n);
}

function fmtNgn(n: number) {
  return '₦' + addThousandSeparator(n);
}

const UserBalancesPage: React.FC = () => {
  const { token } = useAuth();
  const [balanceCurrency, setBalanceCurrency] = useState<BalanceCurrency>('usd');
  const [sort, setSort] = useState<SortOrder>('balance-desc');
  const [dateRange, setDateRange] = useState('All');
  const [dateRangePresetActive, setDateRangePresetActive] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 400);
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const limit = 20;

  const resolvedDates = useMemo(
    () => apiDateParams({ dateRange, dateRangePresetActive }),
    [dateRange, dateRangePresetActive]
  );

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['admin-user-balances', token, sort, balanceCurrency, resolvedDates.startDate, resolvedDates.endDate, debouncedSearch, page, limit],
    queryFn: () =>
      getAdminUserBalances({
        token: token!,
        sort,
        balanceCurrency,
        startDate: resolvedDates.startDate,
        endDate: resolvedDates.endDate,
        dateRange: dateRangePresetActive && dateRange !== 'All' ? dateRange : undefined,
        search: debouncedSearch || undefined,
        page,
        limit,
      }),
    enabled: !!token,
    placeholderData: keepPreviousData,
  });

  const { data: summary } = useQuery({
    queryKey: ['admin-user-balances-summary', token],
    queryFn: () => getAdminUserBalancesSummary(token!),
    enabled: !!token,
  });

  const initialLoad = isLoading && !data;
  const rows: AdminUserBalanceRow[] = data?.rows ?? [];
  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;

  return (
    <div className="w-full mb-10">
      <h1 className="text-[40px] font-normal text-gray-800 mb-2">User Wallets</h1>
      <p className="text-sm text-gray-600 mb-6 max-w-3xl">
        Click a customer to open their wallet profile — virtual balance (bought with Naira), on-chain balance (deposits), deposit status, sold amounts, and virtual activity.
      </p>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <p className="text-xs text-purple-700 font-medium uppercase">Total Virtual</p>
            <p className="text-xl font-semibold text-purple-900">{fmtUsd(summary.totalVirtualUsd)}</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-xs text-blue-700 font-medium uppercase">Total On-chain</p>
            <p className="text-xl font-semibold text-blue-900">{fmtUsd(summary.totalOnChainUsd)}</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <p className="text-xs text-green-700 font-medium uppercase">Combined Crypto</p>
            <p className="text-xl font-semibold text-green-900">{fmtUsd(summary.totalCryptoUsd)}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-medium uppercase">NGN Wallets</p>
            <p className="text-xl font-semibold text-gray-900">{fmtNgn(summary.totalNairaWallet)}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sort by</label>
            <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => { setBalanceCurrency('usd'); setPage(1); }}
                className={`px-4 py-2 text-sm font-medium ${balanceCurrency === 'usd' ? 'bg-[#147341] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Crypto ($)
              </button>
              <button
                type="button"
                onClick={() => { setBalanceCurrency('ngn'); setPage(1); }}
                className={`px-4 py-2 text-sm font-medium border-l border-gray-300 ${balanceCurrency === 'ngn' ? 'bg-[#147341] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                NGN wallet
              </button>
            </div>
          </div>
          <div className="relative">
            <label className="block text-xs text-gray-500 mb-1">Order</label>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortOrder); setPage(1); }}
              className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white min-w-[200px]"
            >
              {ORDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Period</label>
            <select
              value={dateRange}
              onChange={(e) => { setDateRange(e.target.value); setDateRangePresetActive(true); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white"
            >
              <option value="All">All</option>
              {DATE_RANGE_PRESETS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center border bg-white border-gray-300 rounded-full px-4 py-2 w-[220px] shadow-sm">
          <FiSearch className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-sm text-gray-600 w-full bg-transparent"
          />
        </div>
      </div>

      <ListFetchingIndicator show={isFetching && !initialLoad} />
      {initialLoad && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">Loading user wallets…</div>
      )}
      {isError && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-red-600">Failed to load user wallets.</div>
      )}
      {!initialLoad && !isError && (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Virtual ($)</th>
                  <th className="py-3 px-4">On-chain ($)</th>
                  <th className="py-3 px-4">Total crypto ($)</th>
                  <th className="py-3 px-4">NGN wallet</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-green-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(row.id)}
                        className="text-left group"
                      >
                        <p className="font-medium text-gray-800 group-hover:text-[#147341]">{row.name}</p>
                        <p className="text-xs text-gray-500">{row.email}</p>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-purple-800 font-medium">{fmtUsd(row.virtualBalanceUsd)}</td>
                    <td className="py-3 px-4 text-blue-800 font-medium">{fmtUsd(row.onChainBalanceUsd)}</td>
                    <td className="py-3 px-4 font-semibold">{fmtUsd(row.totalBalanceUsd)}</td>
                    <td className="py-3 px-4">{fmtNgn(row.nairaBalance)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(row.id)}
                        className="px-3 py-1.5 text-sm font-medium text-[#147341] border border-[#147341]/40 rounded-lg hover:bg-[#147341] hover:text-white transition-colors"
                      >
                        View wallet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>Page {page} of {totalPages} ({total} total)</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50">Previous</button>
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </>
      )}

      {token && (
        <UserWalletDetailModal
          isOpen={selectedUserId != null}
          userId={selectedUserId}
          token={token}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
};

export default UserBalancesPage;
