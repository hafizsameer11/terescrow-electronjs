import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiSearch } from 'react-icons/fi';
import { useAuth } from '@renderer/context/authContext';
import { getAdminUserBalances } from '@renderer/api/admin/userBalances';
import { addThousandSeparator } from '@renderer/api/helper';

type SortOption =
  | 'name-az'
  | 'name-za'
  | 'total-balance-asc'
  | 'total-balance-desc'
  | 'crypto-balance-asc'
  | 'crypto-balance-desc'
  | 'local-balance-asc'
  | 'local-balance-desc';

interface UserBalanceRow {
  id: number;
  name: string;
  email: string;
  totalBalanceUsd: string;
  totalBalanceN: string;
  cryptoBalanceUsd: string;
  cryptoBalanceN: string;
  nairaBalance: string;
}

function formatRow(row: {
  id: number;
  name: string;
  email: string;
  totalBalanceUsd: number;
  totalBalanceN: number;
  cryptoBalanceUsd: number;
  cryptoBalanceN: number;
  nairaBalance: number;
}): UserBalanceRow {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    totalBalanceUsd: '$' + addThousandSeparator(row.totalBalanceUsd),
    totalBalanceN: 'N' + addThousandSeparator(row.totalBalanceN),
    cryptoBalanceUsd: '$' + addThousandSeparator(row.cryptoBalanceUsd),
    cryptoBalanceN: 'N' + addThousandSeparator(row.cryptoBalanceN),
    nairaBalance: 'N' + addThousandSeparator(row.nairaBalance),
  };
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name-az', label: 'Name (A-Z)' },
  { value: 'name-za', label: 'Name (Z-A)' },
  { value: 'total-balance-asc', label: 'Total balance - Ascending' },
  { value: 'total-balance-desc', label: 'Total balance - Descending' },
  { value: 'crypto-balance-asc', label: 'Crypto balance - Ascending' },
  { value: 'crypto-balance-desc', label: 'Crypto balance - Descending' },
  { value: 'local-balance-asc', label: 'Local balance - Ascending' },
  { value: 'local-balance-desc', label: 'Local balance - Descending' },
];

const UserBalancesPage: React.FC = () => {
  const { token } = useAuth();
  const [sort, setSort] = useState<SortOption>('name-az');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-user-balances', token, sort, startDate, endDate, dateRange, search, page, limit],
    queryFn: () =>
      getAdminUserBalances({
        token: token!,
        sort,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        dateRange: dateRange || undefined,
        search: search || undefined,
        page,
        limit,
      }),
    enabled: !!token,
  });

  const rows: UserBalanceRow[] = useMemo(() => {
    const raw = data?.rows ?? [];
    return raw.map(formatRow);
  }, [data?.rows]);

  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;

  return (
    <div className="w-full mb-10">
      <h1 className="text-[40px] font-normal text-gray-800 mb-6">User Balances</h1>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white min-w-[200px]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</span>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="dd/mm/yyyy"
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-800"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="dd/mm/yyyy"
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-800"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Period</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white"
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
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

      {isLoading && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">Loading user balances…</div>
      )}
      {isError && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-red-600">Failed to load user balances.</div>
      )}
      {!isLoading && !isError && (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Total Balance ($)</th>
                  <th className="py-3 px-4">Total Balance (N)</th>
                  <th className="py-3 px-4">Crypto Balance ($)</th>
                  <th className="py-3 px-4">Crypto Balance (N)</th>
                  <th className="py-3 px-4">Naira Balance</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{row.name}</td>
                    <td className="py-3 px-4">{row.email}</td>
                    <td className="py-3 px-4">{row.totalBalanceUsd}</td>
                    <td className="py-3 px-4">{row.totalBalanceN}</td>
                    <td className="py-3 px-4">{row.cryptoBalanceUsd}</td>
                    <td className="py-3 px-4">{row.cryptoBalanceN}</td>
                    <td className="py-3 px-4">{row.nairaBalance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Page {page} of {totalPages} ({total} total)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserBalancesPage;
