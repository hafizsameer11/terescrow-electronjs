import React, { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { FiSearch } from 'react-icons/fi';
import { useAuth } from '@renderer/context/authContext';
import {
  listBushaCustomerWallets,
  type BushaCustomerWalletRow,
} from '@renderer/api/admin/busha';
import { addThousandSeparator } from '@renderer/api/helper';
import { useDebouncedValue } from '@renderer/utils/useDebouncedValue';
import ListFetchingIndicator from '@renderer/components/ListFetchingIndicator';
import BushaCustomerWalletModal from '@renderer/components/modal/BushaCustomerWalletModal';

type SortOption =
  | 'newest'
  | 'oldest'
  | 'trades-desc'
  | 'trades-asc'
  | 'name-az'
  | 'name-za';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'trades-desc', label: 'Most trades' },
  { value: 'trades-asc', label: 'Fewest trades' },
  { value: 'name-az', label: 'Name (A–Z)' },
  { value: 'name-za', label: 'Name (Z–A)' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];

function fmtNgn(n: number) {
  return '₦' + addThousandSeparator(n);
}

function statusPill(status?: string | null) {
  const s = String(status || '').toLowerCase();
  const cls =
    ['active', 'verified', 'approved'].includes(s)
      ? 'bg-green-100 text-green-800 border-green-200'
      : ['pending', 'inactive'].includes(s) || s.includes('pending')
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : ['failed', 'rejected', 'cancelled'].some((x) => s.includes(x))
          ? 'bg-red-100 text-red-800 border-red-200'
          : 'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${cls}`}>
      {status || '—'}
    </span>
  );
}

function lastTradeLabel(row: BushaCustomerWalletRow) {
  const t = row.lastTrade;
  if (!t) return '—';
  const side = String(t.side || '').toLowerCase();
  const when = t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '';
  return `${side}${when ? ` · ${when}` : ''}`;
}

const UserBalancesPage: React.FC = () => {
  const { token } = useAuth();
  const [sort, setSort] = useState<SortOption>('newest');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 400);
  const [page, setPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const limit = 20;

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['busha-customer-wallets', token, sort, status, debouncedSearch, page, limit],
    queryFn: () =>
      listBushaCustomerWallets(token!, {
        sort,
        status: status === 'all' ? undefined : status,
        search: debouncedSearch || undefined,
        page,
        limit,
      }),
    enabled: !!token,
    placeholderData: keepPreviousData,
  });

  const initialLoad = isLoading && !data;
  const rows = data?.rows ?? [];
  const summary = data?.summary;
  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;

  const sideBreakdown = useMemo(() => summary?.sideBreakdown || {}, [summary?.sideBreakdown]);

  return (
    <div className="w-full mb-10">
      <h1 className="text-[40px] font-normal text-gray-800 mb-2">Busha Wallets</h1>
      <p className="text-sm text-gray-600 mb-6 max-w-3xl">
        Busha crypto customers linked to the app — KYC status, trade activity, and live balances. Open a row to see
        wallet holdings and recent buy / sell / receive / send / swap activity.
      </p>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
            <p className="text-xs text-emerald-700 font-medium uppercase">Customers</p>
            <p className="text-xl font-semibold text-emerald-900">{summary.customers}</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <p className="text-xs text-green-700 font-medium uppercase">Active</p>
            <p className="text-xl font-semibold text-green-900">{summary.activeCustomers}</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-xs text-blue-700 font-medium uppercase">Total trades</p>
            <p className="text-xl font-semibold text-blue-900">{summary.trades}</p>
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
            <p className="text-xs text-orange-700 font-medium uppercase">Buy / Sell</p>
            <p className="text-xl font-semibold text-orange-900">
              {(sideBreakdown.buy || 0) + (sideBreakdown.sell || 0)}
              <span className="text-sm font-normal text-orange-700/80 ml-1">
                ({sideBreakdown.buy || 0} buy · {sideBreakdown.sell || 0} sell)
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden bg-white">
              {STATUS_FILTERS.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setStatus(opt.value);
                    setPage(1);
                  }}
                  className={`px-3 py-2 text-sm font-medium ${i > 0 ? 'border-l border-gray-300' : ''} ${
                    status === opt.value ? 'bg-[#147341] text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sort</label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortOption);
                setPage(1);
              }}
              className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white min-w-[180px]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center border bg-white border-gray-300 rounded-full px-4 py-2 w-[260px] shadow-sm">
          <FiSearch className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="outline-none text-sm text-gray-600 w-full bg-transparent"
          />
        </div>
      </div>

      <ListFetchingIndicator show={isFetching && !initialLoad} />
      {initialLoad && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          Loading Busha customers…
        </div>
      )}
      {isError && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-red-600">
          Failed to load Busha customer wallets.
        </div>
      )}
      {!initialLoad && !isError && (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">App user</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Trades</th>
                  <th className="py-3 px-4">Buy / Sell vol</th>
                  <th className="py-3 px-4">Last trade</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500">
                      No Busha customers found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-t hover:bg-green-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerId(row.id)}
                          className="text-left group"
                        >
                          <p className="font-medium text-gray-800 group-hover:text-[#147341]">
                            {row.firstName} {row.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{row.email}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{row.phone}</p>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        {row.user ? (
                          <div>
                            <p className="font-medium text-gray-800">@{row.user.username}</p>
                            <p className="text-xs text-gray-500">{row.user.email}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Not linked</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{statusPill(row.status)}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900">{row.tradeStats.total}</p>
                        <p className="text-[11px] text-gray-500">
                          {row.tradeStats.completed} done · B{row.tradeStats.buy} S{row.tradeStats.sell} R
                          {row.tradeStats.receive}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-emerald-800 font-medium text-xs">
                          Buy {fmtNgn(row.tradeStats.volumeBuyNgn || 0)}
                        </p>
                        <p className="text-orange-800 font-medium text-xs">
                          Sell {fmtNgn(row.tradeStats.volumeSellNgn || 0)}
                        </p>
                      </td>
                      <td className="py-3 px-4 capitalize text-gray-600">{lastTradeLabel(row)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerId(row.id)}
                          className="px-3 py-1.5 text-sm font-medium text-[#147341] border border-[#147341]/40 rounded-lg hover:bg-[#147341] hover:text-white transition-colors"
                        >
                          View wallet
                        </button>
                      </td>
                    </tr>
                  ))
                )}
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

      {token && (
        <BushaCustomerWalletModal
          isOpen={selectedCustomerId != null}
          customerId={selectedCustomerId}
          token={token}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}
    </div>
  );
};

export default UserBalancesPage;
