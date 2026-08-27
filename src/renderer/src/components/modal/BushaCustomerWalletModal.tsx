import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IoClose } from 'react-icons/io5';
import {
  getBushaCustomerWalletOverview,
  type BushaBalance,
  type BushaTrade,
} from '@renderer/api/admin/busha';
import { addThousandSeparator } from '@renderer/api/helper';

interface Props {
  isOpen: boolean;
  customerId: string | null;
  token: string;
  onClose: () => void;
}

function fmtNgn(n: number) {
  return '₦' + addThousandSeparator(n);
}

function fmtAmt(amount?: string | null, currency?: string | null) {
  if (amount == null || amount === '') return '—';
  const n = parseFloat(String(amount).replace(/,/g, ''));
  const cur = (currency || '').toUpperCase();
  if (!Number.isFinite(n)) return `${amount}${cur ? ` ${cur}` : ''}`;
  if (cur === 'NGN') return fmtNgn(n);
  return `${addThousandSeparator(n)}${cur ? ` ${cur}` : ''}`;
}

function statusPill(status?: string | null) {
  const s = String(status || '').toLowerCase();
  const cls =
    ['active', 'verified', 'approved', 'completed', 'successful', 'funds_delivered', 'funds_converted', 'wallet_credited'].includes(s)
      ? 'bg-green-100 text-green-800 border-green-200'
      : ['pending', 'inactive', 'processing', 'awaiting_crypto_deposit'].some((x) => s.includes(x))
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : ['failed', 'cancelled', 'canceled', 'rejected'].some((x) => s.includes(x))
          ? 'bg-red-100 text-red-800 border-red-200'
          : 'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${cls}`}>
      {status || 'unknown'}
    </span>
  );
}

function balAmount(b: BushaBalance): string {
  return b.available?.amount || b.total?.amount || '0';
}

const BushaCustomerWalletModal: React.FC<Props> = ({ isOpen, customerId, token, onClose }) => {
  const [tab, setTab] = useState<'balances' | 'trades'>('balances');

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['busha-customer-wallet-overview', token, customerId],
    queryFn: () => getBushaCustomerWalletOverview(token, customerId!),
    enabled: isOpen && !!token && !!customerId,
  });

  const balances = useMemo(() => {
    const list = data?.wallet?.balances || [];
    return [...list].sort((a, b) => {
      const an = parseFloat(balAmount(a)) || 0;
      const bn = parseFloat(balAmount(b)) || 0;
      return bn - an;
    });
  }, [data?.wallet?.balances]);

  const nonZero = balances.filter((b) => (parseFloat(balAmount(b)) || 0) > 0);
  const ngnBal = balances.find((b) => String(b.currency).toUpperCase() === 'NGN');

  if (!isOpen || !customerId) return null;

  const c = data?.customer;
  const stats = data?.tradeStats;
  const remote = data?.bushaRemote;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {c ? `${c.firstName} ${c.lastName}` : 'Customer wallet'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{c?.email || 'Loading…'}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {c && statusPill(c.status)}
              {remote?.level && (
                <span className="text-xs text-gray-500 border border-gray-200 rounded-full px-2 py-0.5">
                  Level {remote.level}
                </span>
              )}
              {c?.user && (
                <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                  App: @{c.user.username}
                </span>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <IoClose size={22} />
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1">
          {isLoading && <p className="text-gray-500 text-center py-10">Loading Busha wallet…</p>}
          {isError && (
            <div className="text-center py-10">
              <p className="text-red-600 mb-3">Failed to load wallet overview.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Retry
              </button>
            </div>
          )}

          {data && !isLoading && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                  <p className="text-[11px] uppercase text-gray-500 font-medium">Trades</p>
                  <p className="text-lg font-semibold text-gray-900">{stats?.total ?? 0}</p>
                </div>
                <div className="rounded-xl bg-green-50 border border-green-100 p-3">
                  <p className="text-[11px] uppercase text-green-700 font-medium">Completed</p>
                  <p className="text-lg font-semibold text-green-900">{stats?.completed ?? 0}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                  <p className="text-[11px] uppercase text-emerald-700 font-medium">Buy vol (NGN)</p>
                  <p className="text-lg font-semibold text-emerald-900">{fmtNgn(stats?.volumeBuyNgn || 0)}</p>
                </div>
                <div className="rounded-xl bg-orange-50 border border-orange-100 p-3">
                  <p className="text-[11px] uppercase text-orange-700 font-medium">Sell vol (NGN)</p>
                  <p className="text-lg font-semibold text-orange-900">{fmtNgn(stats?.volumeSellNgn || 0)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5 text-center text-xs">
                {(
                  [
                    ['Buy', stats?.buy],
                    ['Sell', stats?.sell],
                    ['Receive', stats?.receive],
                    ['Send', stats?.send],
                    ['Swap', stats?.convert],
                  ] as const
                ).map(([label, n]) => (
                  <div key={label} className="rounded-lg border border-gray-200 py-2">
                    <p className="text-gray-500">{label}</p>
                    <p className="font-semibold text-gray-800">{n ?? 0}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setTab('balances')}
                    className={`px-3 py-1.5 text-sm ${tab === 'balances' ? 'bg-[#147341] text-white' : 'bg-white text-gray-700'}`}
                  >
                    Live balances
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('trades')}
                    className={`px-3 py-1.5 text-sm border-l border-gray-200 ${tab === 'trades' ? 'bg-[#147341] text-white' : 'bg-white text-gray-700'}`}
                  >
                    Recent trades
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="text-sm text-[#147341] hover:underline disabled:opacity-50"
                >
                  {isFetching ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>

              {tab === 'balances' && (
                <div>
                  {data.walletError && (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                      {data.walletError}
                    </p>
                  )}
                  {ngnBal && (
                    <div className="mb-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">NGN balance</p>
                        <p className="text-xl font-semibold text-gray-900">{fmtAmt(balAmount(ngnBal), 'NGN')}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {nonZero.length} asset{nonZero.length === 1 ? '' : 's'} with balance
                      </p>
                    </div>
                  )}
                  {balances.length === 0 ? (
                    <p className="text-gray-500 text-sm py-6 text-center">No balances returned from Busha.</p>
                  ) : (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                          <tr>
                            <th className="text-left py-2 px-3">Asset</th>
                            <th className="text-left py-2 px-3">Type</th>
                            <th className="text-right py-2 px-3">Available</th>
                            <th className="text-right py-2 px-3">Pending</th>
                          </tr>
                        </thead>
                        <tbody>
                          {balances.map((b) => (
                            <tr key={b.id || b.currency} className="border-t border-gray-100">
                              <td className="py-2 px-3 font-medium text-gray-800">
                                {b.currency}
                                {b.name ? <span className="text-gray-400 font-normal"> · {b.name}</span> : null}
                              </td>
                              <td className="py-2 px-3 text-gray-500 capitalize">{b.type || '—'}</td>
                              <td className="py-2 px-3 text-right font-medium">
                                {fmtAmt(b.available?.amount, b.currency)}
                              </td>
                              <td className="py-2 px-3 text-right text-gray-500">
                                {fmtAmt(b.pending?.amount, b.currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {tab === 'trades' && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {(data.trades || []).length === 0 ? (
                    <p className="text-gray-500 text-sm py-8 text-center">No trades yet.</p>
                  ) : (
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                          <th className="text-left py-2 px-3">Side</th>
                          <th className="text-left py-2 px-3">Pair</th>
                          <th className="text-left py-2 px-3">Amount</th>
                          <th className="text-left py-2 px-3">Status</th>
                          <th className="text-left py-2 px-3">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data.trades as BushaTrade[]).map((t) => (
                          <tr key={t.id} className="border-t border-gray-100">
                            <td className="py-2 px-3 font-medium capitalize">{t.side}</td>
                            <td className="py-2 px-3 text-gray-600">
                              {t.sourceCurrency} → {t.targetCurrency}
                            </td>
                            <td className="py-2 px-3">
                              {fmtAmt(t.sourceAmount, t.sourceCurrency)}
                              {t.targetAmount ? (
                                <span className="text-gray-400"> → {fmtAmt(t.targetAmount, t.targetCurrency)}</span>
                              ) : null}
                            </td>
                            <td className="py-2 px-3">{statusPill(t.status || t.bushaStatus)}</td>
                            <td className="py-2 px-3 text-gray-500 whitespace-nowrap">
                              {t.createdAt ? new Date(t.createdAt).toLocaleString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              <div className="mt-4 text-xs text-gray-400 space-y-1">
                <p>Busha profile: {c?.bushaProfileId}</p>
                {c?.phone && <p>Phone: {c.phone}</p>}
                {c?.createdAt && <p>Created: {new Date(c.createdAt).toLocaleString()}</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BushaCustomerWalletModal;
