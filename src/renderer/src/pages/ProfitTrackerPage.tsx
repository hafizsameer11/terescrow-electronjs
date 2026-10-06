import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FaChartLine } from 'react-icons/fa';
import { FiEye, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@renderer/context/authContext';
import {
  getMarkupProfitOverview,
  getProfitTrackerConfigs,
  getProfitTrackerLedger,
  saveProfitFeeSettings,
} from '@renderer/api/admin/profitTracker';
import { formatNairaAmount } from '@renderer/api/helper';
import { toastError, toastSuccess } from '@renderer/utils/toast';
import { formatProfitTrackerLabel } from '@renderer/utils/formatLabels';
import ProfitTrackerConfigsTab from '@renderer/components/profitTracker/ProfitTrackerConfigsTab';
import { LedgerDetailView, formatLedgerDate } from '@renderer/components/profitTracker/LedgerDetailView';

type Tab = 'overview' | 'ledger' | 'config';

function fmtNgn(n: number) {
  return `₦${formatNairaAmount(n || 0)}`;
}

function str(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function formatLedgerNgn(v: unknown): string {
  if (v === null || v === undefined) return '—';
  const n = parseFloat(String(v).replace(/,/g, ''));
  const formatted = formatNairaAmount(v as string | number);
  if (!Number.isFinite(n)) return formatted;
  return n < 0 ? `-₦${formatted.replace(/^-/, '')}` : `₦${formatted}`;
}

function profitClass(v: unknown): string {
  const n = parseFloat(String(v ?? '').replace(/,/g, ''));
  if (!Number.isFinite(n)) return 'text-gray-800';
  if (n < 0) return 'text-red-600 font-semibold';
  if (n > 0) return 'text-[#147341] font-semibold';
  return 'text-gray-500';
}

function ledgerRow(r: Record<string, unknown>) {
  const meta =
    r.meta && typeof r.meta === 'object' && !Array.isArray(r.meta)
      ? (r.meta as Record<string, unknown>)
      : null;
  const cryptoAmt = meta?.amountCrypto;
  const amountLabel =
    cryptoAmt != null
      ? `${formatProfitTrackerLabel(String(r.asset ?? ''))} ${String(cryptoAmt)}`
      : r.amountUsd != null
        ? `$${String(r.amountUsd).replace(/,/g, '')}`
        : str(r.amount);

  return {
    when: formatLedgerDate(r.sourceOccurredAt ?? r.createdAt),
    transactionType: formatProfitTrackerLabel(String(r.transactionType)),
    asset: str(r.asset),
    amountLabel,
    profitNgn: formatLedgerNgn(r.profitNgn),
    status: str(r.status),
  };
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

  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerLimit] = useState(20);
  const [filterTxType, setFilterTxType] = useState('');
  const [ledgerDetail, setLedgerDetail] = useState<Record<string, unknown> | null>(null);

  const overviewQuery = useQuery({
    queryKey: ['markup-profit-overview', token, startDate, endDate],
    queryFn: () =>
      getMarkupProfitOverview(token!, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: 50,
      }),
    enabled: !!token && (tab === 'overview' || tab === 'config'),
  });

  const ledgerFilterParams = useMemo(
    () => ({
      transactionType: filterTxType.trim() || undefined,
      startDate: startDate.trim() || undefined,
      endDate: endDate.trim() || undefined,
    }),
    [filterTxType, startDate, endDate]
  );

  const ledgerQuery = useQuery({
    queryKey: ['profit-tracker-ledger', token, ledgerFilterParams, ledgerPage, ledgerLimit],
    queryFn: () =>
      getProfitTrackerLedger(token!, { ...ledgerFilterParams, page: ledgerPage, limit: ledgerLimit }),
    enabled: !!token && tab === 'ledger',
  });

  const configsQuery = useQuery({
    queryKey: ['profit-tracker-configs', token],
    queryFn: () => getProfitTrackerConfigs(token!),
    enabled: !!token && tab === 'config',
  });

  useEffect(() => {
    const s = overviewQuery.data?.settings;
    if (!s) return;
    setFeePercent(String(s.billPaymentFeePercent ?? 0));
    setFeeLabel(s.billPaymentFeeLabel === 'profit' ? 'profit' : 'merchant_fee');
  }, [overviewQuery.data?.settings]);

  useEffect(() => {
    setLedgerPage(1);
  }, [filterTxType, startDate, endDate]);

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
  const ledgerItems = ledgerQuery.data?.items ?? [];
  const ledgerTotalPages = ledgerQuery.data?.totalPages ?? 0;
  const ledgerTotal = ledgerQuery.data?.total ?? 0;

  const tabLabel = (t: Tab) => (t === 'config' ? 'Config' : t === 'ledger' ? 'Ledger' : 'Overview');

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
              Tracks admin markup on Busha buy/sell trades, gift card sell profit, and merchant fee on bill
              payments — plus the full profit ledger and config rules.
            </p>
          </div>
        </div>
        <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
          {(['overview', 'ledger', 'config'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                tab === t ? 'bg-[#147341] text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tabLabel(t)}
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
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
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
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                <p className="text-xs uppercase text-violet-700 font-medium">Gift card sell</p>
                <p className="text-2xl font-semibold text-violet-900">
                  {fmtNgn(summary.giftCardSellProfitNgn ?? 0)}
                </p>
                <p className="text-xs text-violet-700/80 mt-1">
                  {summary.giftCardSellsWithProfit ?? 0} sales with profit
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
                      <td className="py-2.5 px-4">
                        <div>{fmtNgn(t.actualAmountNgn)}</div>
                        {t.sourceCurrency && t.targetCurrency ? (
                          <div className="text-xs text-gray-400">
                            {String(t.sourceAmount || '')} {t.sourceCurrency} →{' '}
                            {t.targetCurrency}
                          </div>
                        ) : null}
                      </td>
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

      {tab === 'ledger' && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Transaction type</label>
              <select
                value={filterTxType}
                onChange={(e) => setFilterTxType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[10rem]"
              >
                <option value="">All types</option>
                <option value="BUY">Buy crypto</option>
                <option value="SELL">Sell crypto</option>
                <option value="SEND">Send</option>
                <option value="RECEIVE">Receive</option>
                <option value="SWAP">Swap</option>
                <option value="BILL_PAYMENTS">Bill payments</option>
                <option value="GIFT_CARD_SELL">Gift card sell</option>
                <option value="WITHDRAWAL">Withdrawal</option>
                <option value="DEPOSIT">Deposit</option>
              </select>
            </div>
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
              onClick={() => ledgerQuery.refetch()}
              className="px-4 py-2 rounded-lg bg-[#147341] text-white text-sm font-medium"
            >
              Refresh
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap justify-between items-center gap-2">
              <div>
                <h2 className="font-semibold text-gray-800">Profit ledger</h2>
                <p className="text-xs text-gray-500 mt-0.5">Click Details for the full breakdown</p>
              </div>
              <span className="text-sm text-gray-500">
                {ledgerTotal} row{ledgerTotal !== 1 ? 's' : ''} · page {ledgerQuery.data?.page ?? ledgerPage} of{' '}
                {Math.max(ledgerTotalPages, 1)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium">
                    <th className="text-left px-4 py-3">When</th>
                    <th className="text-left px-4 py-3">Type</th>
                    <th className="text-left px-4 py-3">Asset</th>
                    <th className="text-left px-4 py-3">Amount</th>
                    <th className="text-left px-4 py-3">Profit</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3 w-24"> </th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerQuery.isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        Loading…
                      </td>
                    </tr>
                  ) : ledgerItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No ledger rows
                      </td>
                    </tr>
                  ) : (
                    ledgerItems.map((raw, idx) => {
                      const row = raw as Record<string, unknown>;
                      const r = ledgerRow(row);
                      return (
                        <tr key={idx} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/90">
                          <td className="px-4 py-2.5 text-xs text-gray-600 whitespace-nowrap">{r.when}</td>
                          <td className="px-4 py-2.5 font-medium text-gray-800">{r.transactionType}</td>
                          <td className="px-4 py-2.5 text-gray-700">{r.asset}</td>
                          <td className="px-4 py-2.5 text-gray-700">{r.amountLabel}</td>
                          <td className={`px-4 py-2.5 ${profitClass(row.profitNgn)}`}>{r.profitNgn}</td>
                          <td className="px-4 py-2.5 text-gray-600">{r.status}</td>
                          <td className="px-4 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => setLedgerDetail(row)}
                              className="inline-flex items-center gap-1 text-xs text-[#147341] font-medium hover:underline"
                            >
                              <FiEye className="w-3.5 h-3.5" />
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {ledgerTotalPages > 1 && (
              <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50/50">
                <button
                  type="button"
                  disabled={ledgerPage <= 1}
                  onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-white disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={ledgerPage >= ledgerTotalPages}
                  onClick={() => setLedgerPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'config' && (
        <div className="mt-6 space-y-6">
          {token && (
            <ProfitTrackerConfigsTab
              token={token}
              data={configsQuery.data}
              isLoading={configsQuery.isLoading}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        </div>
      )}

      {ledgerDetail && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/45"
          role="presentation"
          onClick={() => setLedgerDetail(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLedgerDetail(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white"
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
            <LedgerDetailView row={ledgerDetail} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitTrackerPage;
