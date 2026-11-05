import React, { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { FiSearch } from 'react-icons/fi';
import { useAuth } from '@renderer/context/authContext';
import { listObiexUserWallets } from '@renderer/api/admin/obiex';
import { useDebouncedValue } from '@renderer/utils/useDebouncedValue';
import ListFetchingIndicator from '@renderer/components/ListFetchingIndicator';

function fmtAmt(v: unknown) {
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v ?? '—');
  return n.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

const UserBalancesPage: React.FC = () => {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 400);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['obiex-user-wallets', token, debouncedSearch, page, limit],
    queryFn: () =>
      listObiexUserWallets(token!, {
        page,
        limit,
        search: debouncedSearch || undefined,
      }),
    enabled: !!token,
    placeholderData: keepPreviousData,
    staleTime: 20_000,
  });

  const users = data?.users || [];
  const master = data?.masterBalances || [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="p-6 w-full max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold text-gray-900">Obiex wallets</h1>
          <p className="text-sm text-gray-500 mt-1">
            Customer Obiex ledger balances and live Obiex master wallet.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      <div className="rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-3">
        <p className="text-xs uppercase font-medium text-sky-800 mb-2">Live Obiex master balance</p>
        {master.length === 0 ? (
          <p className="text-sm text-sky-900/70">No master balances loaded (check Obiex credentials).</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {master.map((m) => (
              <div
                key={m.currency}
                className="rounded-lg bg-white border border-sky-100 px-3 py-2 min-w-[100px]"
              >
                <p className="text-[10px] uppercase text-gray-500">{m.currency}</p>
                <p className="text-sm font-semibold text-gray-900 tabular-nums">
                  {fmtAmt(m.available)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white max-w-md">
        <FiSearch className="text-gray-400 shrink-0 mr-2" />
        <input
          type="text"
          placeholder="Search name, email, username, id"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="outline-none text-sm text-gray-700 w-full bg-transparent"
        />
      </div>

      <ListFetchingIndicator isFetching={isFetching && !isLoading} />

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Obiex balances</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-red-600">
                    Failed to load Obiex wallets.
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-gray-500">
                    No customer Obiex balances found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const name =
                    [u.firstname, u.lastname].filter(Boolean).join(' ') ||
                    u.username ||
                    `User #${u.id}`;
                  return (
                    <tr key={u.id} className="border-t border-gray-100 align-top">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{name}</div>
                        <div className="text-xs text-gray-500">#{u.id}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.email || '—'}</td>
                      <td className="px-4 py-3">
                        {(u.balances || []).length === 0 ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {u.balances.map((b) => (
                              <span
                                key={`${u.id}-${b.currency}`}
                                className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs"
                              >
                                <span className="font-semibold text-gray-800">{b.currency}</span>
                                <span className="font-mono text-gray-700">{fmtAmt(b.available)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
          <p className="text-gray-500">
            Page {data?.page ?? page} of {totalPages} · {data?.total ?? 0} users
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBalancesPage;
