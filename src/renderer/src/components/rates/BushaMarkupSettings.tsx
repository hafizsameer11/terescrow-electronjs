import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBushaMarkupRange,
  deleteBushaMarkupRange,
  getBushaStatus,
  listBushaMarkupRanges,
  saveBushaSettings,
  updateBushaMarkupRange,
  type BushaMarkupRange,
} from '@renderer/api/admin/busha';
import { toastError, toastSuccess } from '@renderer/utils/toast';

type Props = {
  token: string;
};

type Draft = {
  side: 'buy' | 'sell';
  minUsd: string;
  maxUsd: string;
  percent: string;
};

const emptyDraft = (): Draft => ({
  side: 'sell',
  minUsd: '1',
  maxUsd: '100',
  percent: '-5',
});

const BushaMarkupSettings: React.FC<Props> = ({ token }) => {
  const queryClient = useQueryClient();
  const [buyMarkup, setBuyMarkup] = useState('0');
  const [sellMarkup, setSellMarkup] = useState('0');
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editingId, setEditingId] = useState<number | null>(null);

  const statusQuery = useQuery({
    queryKey: ['bushaStatus'],
    queryFn: () => getBushaStatus(token),
    enabled: !!token,
    staleTime: 30_000,
    retry: false,
  });

  const rangesQuery = useQuery({
    queryKey: ['bushaMarkupRanges'],
    queryFn: () => listBushaMarkupRanges(token),
    enabled: !!token,
    staleTime: 15_000,
    retry: false,
  });

  const configured = !!statusQuery.data?.busha?.configured;
  const active = !!statusQuery.data?.settings?.isActive && configured;

  useEffect(() => {
    const s = statusQuery.data?.settings;
    if (!s) return;
    setBuyMarkup(String(s.buyMarkupPercent ?? 0));
    setSellMarkup(String(s.sellMarkupPercent ?? 0));
  }, [statusQuery.data?.settings?.buyMarkupPercent, statusQuery.data?.settings?.sellMarkupPercent]);

  const ranges = useMemo(() => {
    const list = (rangesQuery.data || statusQuery.data?.markupRanges || []) as BushaMarkupRange[];
    return [...list].sort((a, b) => {
      if (a.side !== b.side) return a.side.localeCompare(b.side);
      return Number(a.minUsd) - Number(b.minUsd);
    });
  }, [rangesQuery.data, statusQuery.data?.markupRanges]);

  const saveFlatMutation = useMutation({
    mutationFn: () =>
      saveBushaSettings(token, {
        buyMarkupPercent: parseFloat(buyMarkup) || 0,
        sellMarkupPercent: parseFloat(sellMarkup) || 0,
      }),
    onSuccess: () => {
      toastSuccess('Fallback flat markup saved.');
      queryClient.invalidateQueries({ queryKey: ['bushaStatus'] });
    },
    onError: (e: any) => toastError(e?.message || 'Could not save markup'),
  });

  const saveRangeMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        side: draft.side,
        minUsd: parseFloat(draft.minUsd),
        maxUsd: parseFloat(draft.maxUsd),
        percent: parseFloat(draft.percent),
        isActive: true,
      };
      if (!Number.isFinite(payload.minUsd) || !Number.isFinite(payload.maxUsd)) {
        throw new Error('Enter valid min/max USD');
      }
      if (!Number.isFinite(payload.percent)) {
        throw new Error('Enter a valid percent (e.g. 5 or -5)');
      }
      if (editingId != null) {
        return updateBushaMarkupRange(token, editingId, payload);
      }
      return createBushaMarkupRange(token, payload);
    },
    onSuccess: () => {
      toastSuccess(editingId != null ? 'Range updated.' : 'Range added.');
      setEditingId(null);
      setDraft(emptyDraft());
      queryClient.invalidateQueries({ queryKey: ['bushaMarkupRanges'] });
      queryClient.invalidateQueries({ queryKey: ['bushaStatus'] });
    },
    onError: (e: any) => toastError(e?.message || 'Could not save range'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBushaMarkupRange(token, id),
    onSuccess: () => {
      toastSuccess('Range deleted.');
      queryClient.invalidateQueries({ queryKey: ['bushaMarkupRanges'] });
      queryClient.invalidateQueries({ queryKey: ['bushaStatus'] });
    },
    onError: (e: any) => toastError(e?.message || 'Could not delete range'),
  });

  const startEdit = (row: BushaMarkupRange) => {
    setEditingId(row.id);
    setDraft({
      side: row.side === 'buy' ? 'buy' : 'sell',
      minUsd: String(row.minUsd),
      maxUsd: String(row.maxUsd),
      percent: String(row.percent),
    });
  };

  if (statusQuery.isLoading) {
    return (
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
        Loading Busha markup…
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Busha is not configured on the server. Markup applies once Busha API is connected and active.
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-emerald-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-emerald-100 bg-emerald-50/60">
        <h2 className="text-lg font-semibold text-gray-900">Busha crypto markup</h2>
        <p className="text-sm text-gray-600 mt-1">
          Set USD amount ranges with signed % on Busha live rates. Quote updates when the user enters an amount.
          {active ? (
            <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium px-2 py-0.5">
              Active
            </span>
          ) : (
            <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5">
              Busha inactive
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Example: sell <strong>$1–$100</strong> at <strong>-5%</strong> → user gets Busha rate × 0.95. Use{' '}
          <strong>+5%</strong> to give a better rate (Busha × 1.05).
        </p>
      </div>

      <div className="p-5 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">USD range tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Side</label>
            <select
              value={draft.side}
              onChange={(e) => setDraft((d) => ({ ...d, side: e.target.value as 'buy' | 'sell' }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="sell">Sell</option>
              <option value="buy">Buy</option>
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Percent (+ / −)</label>
            <input
              type="number"
              step="0.01"
              value={draft.percent}
              onChange={(e) => setDraft((d) => ({ ...d, percent: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. -5 or 5"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => saveRangeMutation.mutate()}
              disabled={saveRangeMutation.isPending}
              className="px-4 py-2 rounded-lg bg-[#147341] text-white text-sm font-medium hover:bg-[#0f5c33] disabled:opacity-60"
            >
              {saveRangeMutation.isPending ? 'Saving…' : editingId != null ? 'Update' : 'Add range'}
            </button>
            {editingId != null ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setDraft(emptyDraft());
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
                <th className="px-3 py-2 font-medium">Effect</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ranges.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-gray-500">
                    No ranges yet — quotes will use the flat fallback % below.
                  </td>
                </tr>
              ) : (
                ranges.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="px-3 py-2 capitalize">{row.side}</td>
                    <td className="px-3 py-2">
                      ${Number(row.minUsd).toLocaleString()} – ${Number(row.maxUsd).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {Number(row.percent) > 0 ? '+' : ''}
                      {Number(row.percent)}%
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      Busha × {(1 + Number(row.percent) / 100).toFixed(4)}
                    </td>
                    <td className="px-3 py-2 space-x-2">
                      <button
                        type="button"
                        className="text-[#147341] hover:underline"
                        onClick={() => startEdit(row)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:underline"
                        onClick={() => deleteMutation.mutate(row.id)}
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

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Fallback buy markup %</label>
          <p className="text-xs text-gray-500 mb-2">
            Used only when no buy USD range matches. Positive = user pays more.
          </p>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={buyMarkup}
            onChange={(e) => setBuyMarkup(e.target.value)}
            className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Fallback sell markup %</label>
          <p className="text-xs text-gray-500 mb-2">
            Used only when no sell USD range matches. Positive = user receives less (legacy).
          </p>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={sellMarkup}
            onChange={(e) => setSellMarkup(e.target.value)}
            className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600 focus:border-green-600"
          />
        </div>
      </div>

      <div className="px-5 pb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => saveFlatMutation.mutate()}
          disabled={saveFlatMutation.isPending}
          className="px-4 py-2 rounded-lg border border-[#147341] text-[#147341] text-sm font-medium hover:bg-emerald-50 disabled:opacity-60"
        >
          {saveFlatMutation.isPending ? 'Saving…' : 'Save fallback markup'}
        </button>
        <p className="text-xs text-gray-500">
          Fallback: buy {Number(statusQuery.data?.settings?.buyMarkupPercent ?? 0)}% · sell{' '}
          {Number(statusQuery.data?.settings?.sellMarkupPercent ?? 0)}%
        </p>
      </div>
    </div>
  );
};

export default BushaMarkupSettings;
