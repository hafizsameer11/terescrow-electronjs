import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiRefreshCw, FiEye, FiX } from 'react-icons/fi';
import { FaChartLine } from 'react-icons/fa';
import { useAuth } from '@renderer/context/authContext';
import { ApiError } from '@renderer/api/customApiCall';
import {
  getProfitTrackerConfigs,
  getProfitTrackerLedger,
  getProfitTrackerStats,
  postProfitTrackerPreview,
  postProfitTrackerBackfill,
  postProfitTrackerRecompute,
  getProfitTrackerReconcile,
} from '@renderer/api/admin/profitTracker';
import ProfitTrackerConfigsTab from '@renderer/components/profitTracker/ProfitTrackerConfigsTab';
import { LedgerDetailView, formatLedgerDate } from '@renderer/components/profitTracker/LedgerDetailView';
import { formatProfitTrackerLabel } from '@renderer/utils/formatLabels';
import { formatNairaAmount } from '@renderer/api/helper';

type Tab = 'overview' | 'configs' | 'preview' | 'operations';

const fieldCls =
  'px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/35 focus:border-[#147341]';
const btnPrimary = 'px-4 py-2 rounded-lg bg-[#147341] text-white text-sm font-medium hover:bg-[#0d5a2e] disabled:opacity-50 shadow-sm';
const btnSecondary = 'px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50';
const btnOutlineGreen =
  'px-3 py-2 rounded-lg border border-[#147341] text-[#147341] text-sm font-medium hover:bg-[#147341]/10 disabled:opacity-50';

function str(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function formatNgn(v: unknown): string {
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
    profitNgn: formatNgn(r.profitNgn),
    status: str(r.status),
    sourceId: str(r.sourceTransactionId),
  };
}

const ProfitTrackerPage: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('overview');

  const [filterTxType, setFilterTxType] = useState('');
  const [filterAsset, setFilterAsset] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [ledgerLimit, setLedgerLimit] = useState(20);
  const limit = Math.min(100, Math.max(1, ledgerLimit));

  const filterParams = useMemo(
    () => ({
      transactionType: filterTxType.trim() || undefined,
      asset: filterAsset.trim() || undefined,
      status: filterStatus.trim() || undefined,
      startDate: startDate.trim() || undefined,
      endDate: endDate.trim() || undefined,
    }),
    [filterTxType, filterAsset, filterStatus, startDate, endDate]
  );

  useEffect(() => {
    setPage(1);
  }, [limit]);

  const { data: stats = {}, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['profit-tracker-stats', token, filterParams],
    queryFn: () => getProfitTrackerStats(token!, filterParams),
    enabled: !!token && tab === 'overview',
  });

  const { data: ledger, isLoading: ledgerLoading, refetch: refetchLedger } = useQuery({
    queryKey: ['profit-tracker-ledger', token, filterParams, page, limit],
    queryFn: () => getProfitTrackerLedger(token!, { ...filterParams, page, limit }),
    enabled: !!token && tab === 'overview',
  });

  const { data: configs, isLoading: configsLoading } = useQuery({
    queryKey: ['profit-tracker-configs', token],
    queryFn: () => getProfitTrackerConfigs(token!),
    enabled: !!token && tab === 'configs',
  });

  const [ledgerDetail, setLedgerDetail] = useState<Record<string, unknown> | null>(null);

  const [previewTxType, setPreviewTxType] = useState('SELL');
  const [previewAmount, setPreviewAmount] = useState('100');
  const [previewAsset, setPreviewAsset] = useState('USDT');
  const [previewBlockchain, setPreviewBlockchain] = useState('ethereum');
  const [previewService, setPreviewService] = useState('');
  const [previewAmountUsd, setPreviewAmountUsd] = useState('');
  const [previewAmountNgn, setPreviewAmountNgn] = useState('');
  const [previewBuyRate, setPreviewBuyRate] = useState('');
  const [previewSellRate, setPreviewSellRate] = useState('');
  const [previewResult, setPreviewResult] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const previewMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, unknown> = {
        transactionType: previewTxType.trim(),
        amount: previewAmount.trim(),
      };
      if (previewAsset.trim()) body.asset = previewAsset.trim();
      if (previewBlockchain.trim()) body.blockchain = previewBlockchain.trim().toLowerCase();
      if (previewService.trim()) body.service = previewService.trim().toLowerCase();
      if (previewAmountUsd.trim()) body.amountUsd = previewAmountUsd.trim();
      if (previewAmountNgn.trim()) body.amountNgn = previewAmountNgn.trim();
      if (previewBuyRate.trim()) body.buyRate = previewBuyRate.trim();
      if (previewSellRate.trim()) body.sellRate = previewSellRate.trim();
      return postProfitTrackerPreview(token!, body);
    },
    onSuccess: (data) => {
      setPreviewError(null);
      setPreviewResult(JSON.stringify(data, null, 2));
    },
    onError: (e: unknown) => {
      setPreviewResult(null);
      const msg = e instanceof ApiError ? e.message : String(e);
      setPreviewError(msg);
    },
  });

  const [backfillDryRun, setBackfillDryRun] = useState(true);
  const [backfillLimit, setBackfillLimit] = useState('');
  const [recomputeDryRun, setRecomputeDryRun] = useState(true);
  const [recomputeLimit, setRecomputeLimit] = useState('');
  const [reconcileLimit, setReconcileLimit] = useState('');
  const [opsResult, setOpsResult] = useState<string | null>(null);
  const [opsError, setOpsError] = useState<string | null>(null);

  const backfillMutation = useMutation({
    mutationFn: () => {
      const body: { dryRun?: boolean; limit?: number; startDate?: string; endDate?: string } = {
        dryRun: backfillDryRun,
      };
      if (backfillLimit.trim()) body.limit = Number(backfillLimit);
      if (startDate.trim()) body.startDate = startDate.trim();
      if (endDate.trim()) body.endDate = endDate.trim();
      return postProfitTrackerBackfill(token!, body);
    },
    onSuccess: (data) => {
      setOpsError(null);
      setOpsResult(JSON.stringify(data, null, 2));
      queryClient.invalidateQueries({ queryKey: ['profit-tracker-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['profit-tracker-stats'] });
    },
    onError: (e: unknown) => {
      setOpsResult(null);
      setOpsError(e instanceof ApiError ? e.message : String(e));
    },
  });

  const recomputeMutation = useMutation({
    mutationFn: () => {
      const body: {
        dryRun?: boolean;
        limit?: number;
        startDate?: string;
        endDate?: string;
        transactionType?: string;
      } = { dryRun: recomputeDryRun };
      if (recomputeLimit.trim()) body.limit = Number(recomputeLimit);
      if (startDate.trim()) body.startDate = startDate.trim();
      if (endDate.trim()) body.endDate = endDate.trim();
      if (filterTxType.trim()) body.transactionType = filterTxType.trim();
      return postProfitTrackerRecompute(token!, body);
    },
    onSuccess: (data) => {
      setOpsError(null);
      setOpsResult(JSON.stringify(data, null, 2));
      if (!recomputeDryRun) {
        queryClient.invalidateQueries({ queryKey: ['profit-tracker-ledger'] });
        queryClient.invalidateQueries({ queryKey: ['profit-tracker-stats'] });
      }
    },
    onError: (e: unknown) => {
      setOpsResult(null);
      setOpsError(e instanceof ApiError ? e.message : String(e));
    },
  });

  const reconcileMutation = useMutation({
    mutationFn: () => {
      const lim = reconcileLimit.trim() ? Number(reconcileLimit) : undefined;
      return getProfitTrackerReconcile(token!, lim);
    },
    onSuccess: (data) => {
      setOpsError(null);
      setOpsResult(JSON.stringify(data, null, 2));
    },
    onError: (e: unknown) => {
      setOpsResult(null);
      setOpsError(e instanceof ApiError ? e.message : String(e));
    },
  });

  const items = ledger?.items ?? [];
  const totalPages = ledger?.totalPages ?? 0;
  const total = ledger?.total ?? 0;

  const tabBtn = (id: Tab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        tab === id ? 'bg-[#147341] text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full p-6 space-y-6 max-w-[1400px]">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-white via-white to-emerald-50/80 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#147341] text-white shadow-md">
                <FaChartLine className="text-lg" />
              </span>
              Profit Tracker
            </h1>
            <p className="text-sm text-gray-600 mt-3 max-w-2xl leading-relaxed">
              You earn the spread between your two Naira rates. Example: user buys at <strong>₦2,000/$</strong> and sells
              at <strong>₦1,000/$</strong> → you keep <strong>₦1,000 × trade USD</strong> on each trade.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabBtn('overview', 'Overview')}
            {tabBtn('configs', 'Rules')}
            {tabBtn('preview', 'Preview')}
            {tabBtn('operations', 'Operations')}
          </div>
        </div>
      </div>

      {tab === 'overview' && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Filters</p>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Transaction type</label>
                <select
                  className={`${fieldCls} w-40`}
                  value={filterTxType}
                  onChange={(e) => {
                    setFilterTxType(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All types</option>
                  <option value="BUY">Buy crypto</option>
                  <option value="SELL">Sell crypto</option>
                  <option value="SEND">Send</option>
                  <option value="RECEIVE">Receive</option>
                  <option value="SWAP">Swap</option>
                  <option value="BILL_PAYMENTS">Bill payments</option>
                  <option value="WITHDRAWAL">Withdrawal</option>
                  <option value="DEPOSIT">Deposit</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Asset</label>
                <input
                  className={`${fieldCls} w-28`}
                  placeholder="USDT"
                  value={filterAsset}
                  onChange={(e) => {
                    setFilterAsset(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <input
                  className={`${fieldCls} w-32`}
                  placeholder="status"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Start</label>
                <input
                  type="datetime-local"
                  className={`${fieldCls} min-w-[180px]`}
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">End</label>
                <input
                  type="datetime-local"
                  className={`${fieldCls} min-w-[180px]`}
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Page size</label>
                <select
                  className={`${fieldCls} min-w-[5rem]`}
                  value={ledgerLimit}
                  onChange={(e) => setLedgerLimit(Number(e.target.value))}
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => {
                  refetchStats();
                  refetchLedger();
                }}
                className={`inline-flex items-center gap-2 ${btnOutlineGreen}`}
              >
                <FiRefreshCw />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'totalProfit', label: 'Total profit (NGN)' },
              { key: 'profitToday', label: 'Today' },
              { key: 'profitThisWeek', label: 'This week' },
              { key: 'profitThisMonth', label: 'This month' },
            ].map(({ key, label }) => (
              <div
                key={key}
                className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-[#147341] p-5 shadow-sm"
              >
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-xl font-semibold text-gray-800 mt-1">
                  {statsLoading ? '…' : formatNgn(stats[key])}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-100">By transaction type</h3>
              <div className="overflow-x-auto max-h-48 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Profit (NGN)</th>
                      <th className="py-2">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(stats.byTransactionType)
                      ? (stats.byTransactionType as Record<string, unknown>[]).map((row, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="py-2 pr-4">{str(row.transactionType)}</td>
                            <td className="py-2 pr-4">{formatNgn(row.totalProfit)}</td>
                            <td className="py-2">{str(row.count)}</td>
                          </tr>
                        ))
                      : null}
                    {!statsLoading && !Array.isArray(stats.byTransactionType) && (
                      <tr>
                        <td colSpan={3} className="py-4 text-gray-400">
                          No breakdown
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-100">By asset</h3>
              <div className="overflow-x-auto max-h-48 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-4">Asset</th>
                      <th className="py-2 pr-4">Profit (NGN)</th>
                      <th className="py-2">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(stats.byAsset)
                      ? (stats.byAsset as Record<string, unknown>[]).map((row, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="py-2 pr-4">{str(row.asset)}</td>
                            <td className="py-2 pr-4">{formatNgn(row.totalProfit)}</td>
                            <td className="py-2">{str(row.count)}</td>
                          </tr>
                        ))
                      : null}
                    {!statsLoading && !Array.isArray(stats.byAsset) && (
                      <tr>
                        <td colSpan={3} className="py-4 text-gray-400">
                          No breakdown
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3 bg-gray-50/80">
              <div>
                <h2 className="font-semibold text-gray-800">Profit ledger</h2>
                <p className="text-xs text-gray-500 mt-0.5">Click a row for the full spread breakdown</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!token || recomputeMutation.isPending}
                  onClick={() => {
                    setTab('operations');
                    setRecomputeDryRun(true);
                    recomputeMutation.mutate();
                  }}
                  className={`inline-flex items-center gap-2 ${btnSecondary}`}
                >
                  <FiRefreshCw className={recomputeMutation.isPending ? 'animate-spin' : ''} />
                  Recompute (dry run)
                </button>
                <span className="text-sm text-gray-500">
                  {total} row{total !== 1 ? 's' : ''} · page {ledger?.page ?? page} of {Math.max(totalPages, 1)}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium">
                    <th className="text-left px-4 py-3 font-medium">When</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-left px-4 py-3 font-medium">Asset</th>
                    <th className="text-left px-4 py-3 font-medium">Amount</th>
                    <th className="text-left px-4 py-3 font-medium">Profit</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-right px-4 py-3 font-medium w-24"> </th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        Loading…
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No ledger rows
                      </td>
                    </tr>
                  ) : (
                    items.map((raw, idx) => {
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
            {totalPages > 1 && (
              <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50/50">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-white disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'configs' && token && (
        <ProfitTrackerConfigsTab token={token} data={configs} isLoading={configsLoading} />
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

      {tab === 'preview' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-100">Engine preview</h2>
          <p className="text-sm text-gray-600">
            Runs the profit engine without writing to the ledger (<code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">POST …/preview</code>).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">transactionType *</label>
              <input
                className={`w-full ${fieldCls}`}
                value={previewTxType}
                onChange={(e) => setPreviewTxType(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">amount *</label>
              <input
                className={`w-full ${fieldCls}`}
                value={previewAmount}
                onChange={(e) => setPreviewAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">asset</label>
              <input
                className={`w-full ${fieldCls}`}
                value={previewAsset}
                onChange={(e) => setPreviewAsset(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">blockchain</label>
              <input
                className={`w-full ${fieldCls}`}
                value={previewBlockchain}
                onChange={(e) => setPreviewBlockchain(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">service</label>
              <input
                className={`w-full ${fieldCls}`}
                value={previewService}
                onChange={(e) => setPreviewService(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">amountUsd</label>
              <input
                className={`w-full ${fieldCls}`}
                value={previewAmountUsd}
                onChange={(e) => setPreviewAmountUsd(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">amountNgn</label>
              <input
                className={`w-full ${fieldCls}`}
                value={previewAmountNgn}
                onChange={(e) => setPreviewAmountNgn(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">buyRate (override)</label>
              <input
                className={`w-full ${fieldCls}`}
                value={previewBuyRate}
                onChange={(e) => setPreviewBuyRate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">sellRate (override)</label>
              <input
                className={`w-full ${fieldCls}`}
                value={previewSellRate}
                onChange={(e) => setPreviewSellRate(e.target.value)}
              />
            </div>
          </div>
          <button
            type="button"
            disabled={!token || previewMutation.isPending}
            onClick={() => previewMutation.mutate()}
            className={btnPrimary}
          >
            {previewMutation.isPending ? 'Running…' : 'Run preview'}
          </button>
          {previewError && <p className="text-sm text-red-600">{previewError}</p>}
          {previewResult && (
            <pre className="text-xs bg-[#0f172a] text-[#bbf7d0] p-4 rounded-lg border border-gray-700 overflow-auto max-h-96">
              {previewResult}
            </pre>
          )}
        </div>
      )}

      {tab === 'operations' && (
        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-[#147341]/30 bg-[#147341]/5 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Recompute all profit rows</h2>
            <p className="text-sm text-gray-700 mt-2 max-w-3xl leading-relaxed">
              Deletes ledger rows in the selected date range and rebuilds them from source transactions using the
              correct NGN/$ spread. Run a <strong>dry run</strong> first, then uncheck it to apply. Use this after rate
              logic fixes or when you see negative profit / wrong rates like ₦64,474/$.
            </p>
            <div className="flex flex-wrap items-end gap-4 mt-4">
              <label className="inline-flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={recomputeDryRun}
                  onChange={(e) => setRecomputeDryRun(e.target.checked)}
                />
                Dry run only
              </label>
              <div>
                <label className="block text-xs text-gray-500 mb-1">limit (optional)</label>
                <input
                  type="number"
                  className={`${fieldCls} w-32`}
                  placeholder="4500"
                  value={recomputeLimit}
                  onChange={(e) => setRecomputeLimit(e.target.value)}
                />
              </div>
              <button
                type="button"
                disabled={!token || recomputeMutation.isPending}
                onClick={() => recomputeMutation.mutate()}
                className={`${btnPrimary} inline-flex items-center gap-2`}
              >
                <FiRefreshCw className={recomputeMutation.isPending ? 'animate-spin' : ''} />
                {recomputeMutation.isPending
                  ? 'Working…'
                  : recomputeDryRun
                    ? 'Preview recompute'
                    : 'Recompute all now'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Uses Overview filter dates and transaction type when set. Empty dates = default 2-year window.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-100">Other operations</h2>
          <p className="text-sm text-gray-700 border-l-4 border-[#147341] pl-3 py-2 bg-[#147341]/5 rounded-r">
            Live writes to <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-gray-200">profit_ledger</code> on real trades depend on
            the server env <code className="text-xs bg-white px-1 rounded border border-gray-200">PROFIT_TRACKER_WRITE_ENABLED</code> (when set to the string{' '}
            <code className="text-xs bg-white px-1 rounded border border-gray-200">false</code>, new rows are not written). Backfill still calls the API; confirm with
            your backend team if inserts are disabled in an environment.
          </p>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Backfill</h3>
            <p className="text-sm text-gray-600 mb-3">
              Replays historical crypto/fiat transactions into the profit ledger (idempotent). Use dry run first.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={backfillDryRun}
                  onChange={(e) => setBackfillDryRun(e.target.checked)}
                />
                Dry run
              </label>
              <div>
                <label className="block text-xs text-gray-500 mb-1">limit (optional)</label>
                <input
                  type="number"
                  className={`${fieldCls} w-32`}
                  placeholder="default"
                  value={backfillLimit}
                  onChange={(e) => setBackfillLimit(e.target.value)}
                />
              </div>
              <button
                type="button"
                disabled={!token || backfillMutation.isPending}
                onClick={() => backfillMutation.mutate()}
                className={btnPrimary}
              >
                {backfillMutation.isPending ? 'Running…' : 'Run backfill'}
              </button>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Reconcile</h3>
            <p className="text-sm text-gray-600 mb-3">Dry-run counts of rows still missing ledger entries.</p>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">limit (optional)</label>
                <input
                  type="number"
                  className={`${fieldCls} w-32`}
                  value={reconcileLimit}
                  onChange={(e) => setReconcileLimit(e.target.value)}
                />
              </div>
              <button
                type="button"
                disabled={!token || reconcileMutation.isPending}
                onClick={() => reconcileMutation.mutate()}
                className={btnSecondary}
              >
                {reconcileMutation.isPending ? 'Loading…' : 'Run reconcile'}
              </button>
            </div>
          </div>
          {opsError && <p className="text-sm text-red-600">{opsError}</p>}
          {opsResult && (
            <pre className="text-xs bg-[#0f172a] text-[#bbf7d0] p-4 rounded-lg border border-gray-700 overflow-auto max-h-80">
              {opsResult}
            </pre>
          )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitTrackerPage;
