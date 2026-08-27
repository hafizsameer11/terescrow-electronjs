import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FaChartLine } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@renderer/context/authContext';
import {
  getMarkupProfitOverview,
  saveProfitFeeSettings,
} from '@renderer/api/admin/profitTracker';
import { formatNairaAmount } from '@renderer/api/helper';
import { toastError, toastSuccess } from '@renderer/utils/toast';

type Tab = 'overview' | 'settings';

function fmtNgn(n: number) {
  return `₦${formatNairaAmount(n || 0)}`;
}

const ProfitTrackerPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('overview');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [feePercent, setFeePercent] = useState('0');
  const [feeLabel, setFeeLabel] = useState<'merchant_fee' | 'profit'>('merchant_fee');

  const overviewQuery = useQuery({
    queryKey: ['markup-profit-overview', token, startDate, endDate],
    queryFn: () =>
      getMarkupProfitOverview(token!, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: 50,
      }),
    enabled: !!token,
  });

  useEffect(() => {
    const s = overviewQuery.data?.settings;
    if (!s) return;
    setFeePercent(String(s.billPaymentFeePercent ?? 0));
    setFeeLabel(s.billPaymentFeeLabel === 'profit' ? 'profit' : 'merchant_fee');
  }, [overviewQuery.data?.settings]);

  const saveFeeMutation = useMutation({
    mutationFn: () =>
      saveProfitFeeSettings(token!, {
        billPaymentFeePercent: parseFloat(feePercent) || 0,
        billPaymentFeeLabel: feeLabel,
      }),
    onSuccess: () => {
      toastSuccess('Bill payment fee saved.');
      queryClient.invalidateQueries({ queryKey: ['markup-profit-overview'] });
    },
    onError: (e: any) => toastError(e?.message || 'Failed to save fee'),
  });

  const summary = overviewQuery.data?.summary;
  const settings = overviewQuery.data?.settings;
  const trades = overviewQuery.data?.recentMarkupTrades || [];

  return (
    <div className="w-full mb-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#147341]/10 flex items-center justify-center text-[#147341]">
            <FaChartLine />
          </div>
          <div>
            <h1 className="text-[36px] font-normal text-gray-800 leading-tight">Profit Tracker</h1>
            <p className="text-sm text-gray-600 max-w-2xl mt-1">
              Tracks admin markup on Busha buy/sell trades and merchant fee on bill payments — not the old
              dual-rate spread rules.
            </p>
          </div>
        </div>
        <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
          {(['overview', 'settings'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${
                tab === t ? 'bg-[#147341] text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && (
        <>
          <div className="flex flex-wrap items-end gap-3 mb-6 mt-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => overviewQuery.refetch()}
              className="px-4 py-2 rounded-lg bg-[#147341] text-white text-sm font-medium"
            >
              Refresh
            </button>
          </div>

          {overviewQuery.isLoading && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              Loading markup profits…
            </div>
          )}
          {overviewQuery.isError && (
            <div className="bg-white rounded-xl border border-red-200 p-8 text-center text-red-600">
              Failed to load profit overview.
            </div>
          )}

          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <p className="text-xs uppercase text-emerald-700 font-medium">Total profit</p>
                <p className="text-2xl font-semibold text-emerald-900">{fmtNgn(summary.totalProfitNgn)}</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-xs uppercase text-green-700 font-medium">Crypto markup</p>
                <p className="text-2xl font-semibold text-green-900">{fmtNgn(summary.cryptoMarkupNgn)}</p>
                <p className="text-xs text-green-700/80 mt-1">
                  Buy {fmtNgn(summary.buyMarkupNgn)} · Sell {fmtNgn(summary.sellMarkupNgn)}
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <p className="text-xs uppercase text-orange-700 font-medium">Bill payment fees</p>
                <p className="text-2xl font-semibold text-orange-900">{fmtNgn(summary.billPaymentFeeNgn)}</p>
                <p className="text-xs text-orange-700/80 mt-1">{summary.billPaymentsWithFee} payments</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs uppercase text-blue-700 font-medium">Trades with markup</p>
                <p className="text-2xl font-semibold text-blue-900">{summary.tradesWithMarkup}</p>
                {settings && (
                  <p className="text-xs text-blue-700/80 mt-1">
                    Rates: buy {settings.buyMarkupPercent}% · sell {settings.sellMarkupPercent}%
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Recent markup trades</h2>
              <p className="text-xs text-gray-500">Actual Busha amount vs admin markup kept</p>
            </div>
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-2 px-4">Customer</th>
                  <th className="py-2 px-4">Side</th>
                  <th className="py-2 px-4">Actual (Busha)</th>
                  <th className="py-2 px-4">User amount</th>
                  <th className="py-2 px-4">Admin markup</th>
                  <th className="py-2 px-4">%</th>
                  <th className="py-2 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {trades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500">
                      No buy/sell trades with markup yet. Set markup on Rates → Crypto rates.
                    </td>
                  </tr>
                ) : (
                  trades.map((t) => (
                    <tr key={t.id} className="border-t border-gray-100 hover:bg-green-50/40">
                      <td className="py-2.5 px-4">
                        {t.user ? (
                          <>
                            <p className="font-medium text-gray-800">
                              {t.user.firstname} {t.user.lastname}
                            </p>
                            <p className="text-xs text-gray-500">@{t.user.username}</p>
                          </>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 capitalize">{t.side}</td>
                      <td className="py-2.5 px-4">{fmtNgn(t.actualAmountNgn)}</td>
                      <td className="py-2.5 px-4">{fmtNgn(t.userAmountNgn)}</td>
                      <td className="py-2.5 px-4 font-semibold text-[#147341]">{fmtNgn(t.adminMarkupNgn)}</td>
                      <td className="py-2.5 px-4">{t.markupPercent}%</td>
                      <td className="py-2.5 px-4 text-gray-500 whitespace-nowrap">
                        {t.createdAt ? new Date(t.createdAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'settings' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-emerald-100 bg-emerald-50/50">
              <h2 className="font-semibold text-gray-900">Crypto markup (Busha)</h2>
              <p className="text-sm text-gray-600 mt-1">
                Live buy/sell rates come from Busha. Platform markup % is managed on the Rates page.
              </p>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Buy markup</span>
                <span className="font-semibold">{settings?.buyMarkupPercent ?? 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sell markup</span>
                <span className="font-semibold">{settings?.sellMarkupPercent ?? 0}%</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/rates?tab=crypto')}
                className="mt-2 px-4 py-2 rounded-lg border border-[#147341] text-[#147341] text-sm font-medium hover:bg-[#147341] hover:text-white"
              >
                Edit on Rates → Crypto rates
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-orange-100 bg-orange-50/50">
              <h2 className="font-semibold text-gray-900">Bill payment fee</h2>
              <p className="text-sm text-gray-600 mt-1">
                Extra % charged on top of the provider bill amount. Labeled as merchant fee or profit in
                receipts.
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Fee %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={feePercent}
                  onChange={(e) => setFeePercent(e.target.value)}
                  className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: ₦1,000 bill + 2% → user pays ₦1,020; provider gets ₦1,000; you keep ₦20.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Show as</label>
                <select
                  value={feeLabel}
                  onChange={(e) => setFeeLabel(e.target.value as 'merchant_fee' | 'profit')}
                  className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="merchant_fee">Merchant fee</option>
                  <option value="profit">Profit</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => saveFeeMutation.mutate()}
                disabled={saveFeeMutation.isPending}
                className="px-4 py-2 rounded-lg bg-[#147341] text-white text-sm font-medium disabled:opacity-60"
              >
                {saveFeeMutation.isPending ? 'Saving…' : 'Save bill fee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitTrackerPage;
