import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listBushaFeeLedger } from '@renderer/api/admin/busha';
import { useDebouncedValue } from '@renderer/utils/useDebouncedValue';

type Props = { token: string };

const BushaFeeLedgerPanel: React.FC<Props> = ({ token }) => {
  const [status, setStatus] = useState<'all' | 'held' | 'sold'>('all');
  const [currency, setCurrency] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const query = useQuery({
    queryKey: ['bushaFeeLedger', token, status, currency, debouncedSearch, page],
    queryFn: () =>
      listBushaFeeLedger(token, {
        status: status === 'all' ? undefined : status,
        currency: currency || undefined,
        search: debouncedSearch || undefined,
        page,
        limit: 20,
      }),
    enabled: !!token,
  });

  const data = query.data;
  const rows = data?.rows || [];
  const totals = data?.totals;

  const typeLabel = (t: string) => {
    if (t === 'DEPOSIT_FEE') return 'Receive fee';
    if (t === 'WITHDRAW_FEE') return 'Send fee';
    return t;
  };

  const heldSummary = useMemo(() => {
    const list = totals?.heldByCurrency || [];
    if (!list.length) return 'None held';
    return list.map((h) => `${h.amount} ${h.currency}`).join(' · ');
  }, [totals?.heldByCurrency]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-8">
      <div className="mb-5">
        <h3 className="text-xl font-semibold text-gray-800">Fee holds &amp; sales</h3>
        <p className="text-sm text-gray-500 mt-1">
          Track fees still held for customers, and Naira earned when those fees were sold.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
          <div className="text-xs uppercase tracking-wide text-amber-700 font-medium">Currently held</div>
          <div className="text-lg font-semibold text-gray-800 mt-1">{heldSummary}</div>
        </div>
        <div className="rounded-lg bg-green-50 border border-green-100 p-4">
          <div className="text-xs uppercase tracking-wide text-green-700 font-medium">Sold (Naira earned)</div>
          <div className="text-lg font-semibold text-gray-800 mt-1">
            ₦{Number(totals?.soldNgnEarned || 0).toLocaleString('en-NG')}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="flex gap-2">
          {(['all', 'held', 'sold'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                status === s
                  ? 'bg-[#147341] text-white border-[#147341]'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              {s === 'all' ? 'All' : s === 'held' ? 'Held' : 'Sold'}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Coin (e.g. USDT)"
          value={currency}
          onChange={(e) => {
            setCurrency(e.target.value.toUpperCase());
            setPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-32"
        />
        <input
          type="text"
          placeholder="Search customer"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[160px]"
        />
      </div>

      {query.isLoading ? (
        <p className="text-gray-500 text-sm py-6 text-center">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-500 text-sm py-6 text-center">No fee records yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-3 pr-3 font-medium">Date</th>
                <th className="py-3 pr-3 font-medium">Customer</th>
                <th className="py-3 pr-3 font-medium">Coin</th>
                <th className="py-3 pr-3 font-medium">Type</th>
                <th className="py-3 pr-3 font-medium">Amount</th>
                <th className="py-3 pr-3 font-medium">Status</th>
                <th className="py-3 font-medium">Sold NGN</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const name =
                  [r.user?.firstname, r.user?.lastname].filter(Boolean).join(' ') ||
                  r.user?.username ||
                  r.user?.email ||
                  `#${r.userId}`;
                const amt = Number(r.amountCrypto);
                return (
                  <tr key={r.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pr-3 text-gray-600 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-3 text-gray-800">{name}</td>
                    <td className="py-3 pr-3 font-medium">{r.currency}</td>
                    <td className="py-3 pr-3">{typeLabel(r.type)}</td>
                    <td className="py-3 pr-3">
                      {Number.isFinite(amt) ? amt : r.amountCrypto} {r.currency}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.status === 'sold'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status === 'sold' ? 'Sold' : 'Held'}
                      </span>
                    </td>
                    <td className="py-3 text-gray-800">
                      {r.status === 'sold' && r.soldAmountNgn != null
                        ? `₦${Number(r.soldAmountNgn).toLocaleString('en-NG')}`
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {(data?.totalPages || 0) > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Page {data?.page} of {data?.totalPages} ({data?.total} total)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= (data?.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BushaFeeLedgerPanel;
