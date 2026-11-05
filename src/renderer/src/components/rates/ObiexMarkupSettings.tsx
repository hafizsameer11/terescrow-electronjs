import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createObiexMarkupRange,
  deleteObiexMarkupRange,
  getObiexStatus,
  listObiexMarkupRanges,
  saveObiexSettings,
  updateObiexMarkupRange,
  type ObiexMarkupRange,
} from '@renderer/api/admin/obiex';
import { toastError, toastSuccess } from '@renderer/utils/toast';

type Props = { token: string };

type Draft = {
  side: 'buy' | 'sell';
  minUsd: string;
  maxUsd: string;
  percent: string;
};

const emptyDraft = (side: 'buy' | 'sell' = 'buy'): Draft => ({
  side,
  minUsd: '1',
  maxUsd: '199',
  percent: '10',
});

const ObiexMarkupSettings: React.FC<Props> = ({ token }) => {
  const queryClient = useQueryClient();
  const [buyFlatFee, setBuyFlatFee] = useState('0');
  const [sellFlatFee, setSellFlatFee] = useState('0');
  const [buyFallback, setBuyFallback] = useState('0');
  const [sellFallback, setSellFallback] = useState('0');
  const [swapFee, setSwapFee] = useState('0');
  const [receiveFee, setReceiveFee] = useState('0');
  const [sellMarkupGhs, setSellMarkupGhs] = useState('0');
  const [sellFlatFeeGhs, setSellFlatFeeGhs] = useState('0');
  const [withdrawMarkupGhs, setWithdrawMarkupGhs] = useState('0');
  const [withdrawFlatFeeGhs, setWithdrawFlatFeeGhs] = useState('0');
  const [draft, setDraft] = useState<Draft>(emptyDraft('buy'));
  const [editingId, setEditingId] = useState<number | null>(null);

  const statusQuery = useQuery({
    queryKey: ['obiexStatus'],
    queryFn: () => getObiexStatus(token),
    enabled: !!token,
    staleTime: 30_000,
    retry: false,
  });

  const rangesQuery = useQuery({
    queryKey: ['obiexMarkupRanges'],
    queryFn: () => listObiexMarkupRanges(token),
    enabled: !!token,
    staleTime: 15_000,
    retry: false,
  });

  const configured = !!statusQuery.data?.configured;
  const active = !!statusQuery.data?.settings?.isActive && configured;

  useEffect(() => {
    const s = statusQuery.data?.settings;
    if (!s) return;
    setBuyFlatFee(String(s.buyFlatFeeNgn ?? 0));
    setSellFlatFee(String(s.sellFlatFeeNgn ?? 0));
    setBuyFallback(String(s.buyMarkupPercent ?? 0));
    setSellFallback(String(s.sellMarkupPercent ?? 0));
    setSwapFee(String(s.swapFeePercent ?? 0));
    setReceiveFee(String(s.receiveFeePercent ?? 0));
    setSellMarkupGhs(String(s.sellMarkupPercentGhs ?? 0));
    setSellFlatFeeGhs(String(s.sellFlatFeeGhs ?? 0));
    setWithdrawMarkupGhs(String(s.withdrawMarkupPercentGhs ?? 0));
    setWithdrawFlatFeeGhs(String(s.withdrawFlatFeeGhs ?? 0));
  }, [statusQuery.data?.settings]);

  const ranges = useMemo(() => {
    const list = (rangesQuery.data || []) as ObiexMarkupRange[];
    return [...list].sort((a, b) => {
      const sideCmp = String(a.side).localeCompare(String(b.side));
      if (sideCmp !== 0) return sideCmp;
      return Number(a.minUsd) - Number(b.minUsd);
    });
  }, [rangesQuery.data]);

  const saveFeesMutation = useMutation({
    mutationFn: () =>
      saveObiexSettings(token, {
        buyFlatFeeNgn: Math.max(0, parseFloat(buyFlatFee) || 0),
        sellFlatFeeNgn: Math.max(0, parseFloat(sellFlatFee) || 0),
        buyMarkupPercent: Math.max(0, parseFloat(buyFallback) || 0),
        sellMarkupPercent: Math.max(0, parseFloat(sellFallback) || 0),
        swapFeePercent: Math.max(0, parseFloat(swapFee) || 0),
        receiveFeePercent: Math.max(0, parseFloat(receiveFee) || 0),
        sellMarkupPercentGhs: parseFloat(sellMarkupGhs) || 0,
        sellFlatFeeGhs: Math.max(0, parseFloat(sellFlatFeeGhs) || 0),
        withdrawMarkupPercentGhs: parseFloat(withdrawMarkupGhs) || 0,
        withdrawFlatFeeGhs: Math.max(0, parseFloat(withdrawFlatFeeGhs) || 0),
      }),
    onSuccess: () => {
      toastSuccess('Obiex fees saved.');
      queryClient.invalidateQueries({ queryKey: ['obiexStatus'] });
    },
    onError: (e: any) => toastError(e?.message || 'Could not save Obiex fees'),
  });

  const saveRangeMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        side: draft.side,
        minUsd: parseFloat(draft.minUsd),
        maxUsd: parseFloat(draft.maxUsd),
        percent: Math.abs(parseFloat(draft.percent) || 0),
        isActive: true,
      };
      if (!Number.isFinite(payload.minUsd) || !Number.isFinite(payload.maxUsd)) {
        throw new Error('Enter valid min/max USD');
      }
      if (payload.maxUsd < payload.minUsd) {
        throw new Error('Max USD must be ≥ min USD');
      }
      if (!Number.isFinite(payload.percent)) {
        throw new Error('Enter a valid percent (e.g. 10)');
      }
      if (editingId != null) {
        return updateObiexMarkupRange(token, editingId, payload);
      }
      return createObiexMarkupRange(token, payload);
    },
    onSuccess: () => {
      toastSuccess(editingId != null ? 'Tier updated.' : 'Tier added.');
      setEditingId(null);
      setDraft(emptyDraft(draft.side));
      queryClient.invalidateQueries({ queryKey: ['obiexMarkupRanges'] });
    },
    onError: (e: any) => toastError(e?.message || 'Could not save tier'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteObiexMarkupRange(token, id),
    onSuccess: () => {
      toastSuccess('Tier deleted.');
      queryClient.invalidateQueries({ queryKey: ['obiexMarkupRanges'] });
    },
    onError: (e: any) => toastError(e?.message || 'Could not delete tier'),
  });

  const startEdit = (row: ObiexMarkupRange) => {
    setEditingId(row.id);
    setDraft({
      side: row.side === 'sell' ? 'sell' : 'buy',
      minUsd: String(row.minUsd),
      maxUsd: String(row.maxUsd),
      percent: String(Math.abs(Number(row.percent) || 0)),
    });
  };

  if (statusQuery.isLoading) {
    return (
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
        Loading Obiex fees…
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Obiex is not configured on the server. Connect Obiex API credentials to manage markup tiers.
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-sky-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-sky-100 bg-sky-50/60">
        <h2 className="text-lg font-semibold text-gray-900">Obiex crypto markup</h2>
        <p className="text-sm text-gray-600 mt-1">
          USD amount tiers for buy/sell (e.g. 1–199 → 10%, 200–999 → 8%). Also set swap &amp; receive fees.
          {active ? (
            <span className="ml-2 inline-flex items-center rounded-full bg-sky-100 text-sky-800 text-xs font-medium px-2 py-0.5">
              Active
            </span>
          ) : (
            <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5">
              Obiex inactive
            </span>
          )}
        </p>
      </div>

      <div className="p-5 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Buy / sell USD tiers</h3>
        <p className="text-xs text-gray-500 mb-3">
          Percent is platform keep. Buy: user pays more NGN. Sell: user receives less NGN.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Side</label>
            <select
              value={draft.side}
              onChange={(e) =>
                setDraft((d) => ({ ...d, side: e.target.value === 'sell' ? 'sell' : 'buy' }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Min USD</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={draft.minUsd}
              onChange={(e) => setDraft((d) => ({ ...d, minUsd: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Max USD</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={draft.maxUsd}
              onChange={(e) => setDraft((d) => ({ ...d, maxUsd: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Markup %</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={draft.percent}
              onChange={(e) => setDraft((d) => ({ ...d, percent: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. 10"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => saveRangeMutation.mutate()}
              disabled={saveRangeMutation.isPending}
              className="px-4 py-2 rounded-lg bg-sky-700 text-white text-sm font-medium hover:bg-sky-800 disabled:opacity-60"
            >
              {saveRangeMutation.isPending ? 'Saving…' : editingId != null ? 'Update' : 'Add tier'}
            </button>
            {editingId != null ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setDraft(emptyDraft(draft.side));
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-3 py-2 font-medium">Side</th>
                <th className="px-3 py-2 font-medium">USD range</th>
                <th className="px-3 py-2 font-medium">%</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ranges.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                    No tiers yet — add buy/sell ranges above.
                  </td>
                </tr>
              ) : (
                ranges.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100">
                    <td className="px-3 py-2 capitalize font-medium">{r.side}</td>
                    <td className="px-3 py-2 font-mono">
                      ${Number(r.minUsd).toLocaleString()} – ${Number(r.maxUsd).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 font-semibold">
                      {Math.abs(Number(r.percent) || 0)}%
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className="text-sky-700 text-xs font-medium mr-3"
                        onClick={() => startEdit(r)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-600 text-xs font-medium"
                        onClick={() => {
                          if (window.confirm('Delete this tier?')) deleteMutation.mutate(r.id);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Flat fees &amp; fallback %</h3>
          <p className="text-xs text-gray-500 mb-3">
            Fallback % applies when no USD tier matches the trade amount.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Buy flat ₦</label>
              <input
                type="number"
                min={0}
                value={buyFlatFee}
                onChange={(e) => setBuyFlatFee(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sell flat ₦</label>
              <input
                type="number"
                min={0}
                value={sellFlatFee}
                onChange={(e) => setSellFlatFee(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Buy fallback %</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={buyFallback}
                onChange={(e) => setBuyFallback(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sell fallback %</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={sellFallback}
                onChange={(e) => setSellFallback(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Swap &amp; receive fees</h3>
          <p className="text-xs text-gray-500 mb-3">
            Receive: user gets $100 deposit − 1% → $99 credited. Swap: same on convert proceeds.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Swap fee %</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={swapFee}
                onChange={(e) => setSwapFee(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Receive fee %</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={receiveFee}
                onChange={(e) => setReceiveFee(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Ghana (GHS) fees</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sell markup %</label>
            <input
              type="number"
              step="0.01"
              value={sellMarkupGhs}
              onChange={(e) => setSellMarkupGhs(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sell flat GHS</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={sellFlatFeeGhs}
              onChange={(e) => setSellFlatFeeGhs(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Withdraw markup %</label>
            <input
              type="number"
              step="0.01"
              value={withdrawMarkupGhs}
              onChange={(e) => setWithdrawMarkupGhs(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Withdraw flat GHS</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={withdrawFlatFeeGhs}
              onChange={(e) => setWithdrawFlatFeeGhs(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        <button
          type="button"
          onClick={() => saveFeesMutation.mutate()}
          disabled={saveFeesMutation.isPending}
          className="px-4 py-2 rounded-lg bg-sky-700 text-white text-sm font-medium hover:bg-sky-800 disabled:opacity-60"
        >
          {saveFeesMutation.isPending ? 'Saving…' : 'Save Obiex fees'}
        </button>
      </div>
    </div>
  );
};

export default ObiexMarkupSettings;
