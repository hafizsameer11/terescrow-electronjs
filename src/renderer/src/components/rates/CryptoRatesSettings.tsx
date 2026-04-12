import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@renderer/api/customApiCall';
import {
  createCryptoRate,
  deactivateCryptoRate,
  getCryptoRatesGrouped,
  getCryptoRatesHistory,
  updateCryptoRate,
} from '@renderer/api/admin/cryptoRates';
import type { CryptoRateTier, TransactionType } from '@renderer/types/cryptoRates';
import { TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS } from '@renderer/types/cryptoRates';

function num(v: string | number | null | undefined): number {
  if (v == null) return NaN;
  return typeof v === 'number' ? v : Number(v);
}

function sortTiers(t: CryptoRateTier[]): CryptoRateTier[] {
  return [...t].sort((a, b) => num(a.minAmount) - num(b.minAmount));
}

function errMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  return e instanceof Error ? e.message : 'Request failed';
}

const CryptoRatesSettings: React.FC<{ token: string }> = ({ token }) => {
  const queryClient = useQueryClient();
  const [txTab, setTxTab] = useState<TransactionType>('BUY');
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editRate, setEditRate] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [newTier, setNewTier] = useState({ minAmount: '', maxAmount: '', rate: '' });

  const { data: grouped, isLoading } = useQuery({
    queryKey: ['admin-crypto-rates-grouped', token],
    queryFn: () => getCryptoRatesGrouped(token),
    enabled: !!token,
  });

  const { data: historyRows = [], isFetching: historyLoading } = useQuery({
    queryKey: ['admin-crypto-rates-history', token, txTab, historyOpen],
    queryFn: () => getCryptoRatesHistory(token, { transactionType: txTab }),
    enabled: !!token && historyOpen,
  });

  const tiers = useMemo(() => {
    const g = grouped?.[txTab];
    return sortTiers(Array.isArray(g) ? g : []);
  }, [grouped, txTab]);

  useEffect(() => {
    setEditId(null);
  }, [txTab]);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-crypto-rates-grouped'] });
    await queryClient.invalidateQueries({ queryKey: ['admin-crypto-rates-history'] });
  };

  const createMut = useMutation({
    mutationFn: () =>
      createCryptoRate(token, {
        transactionType: txTab,
        minAmount: Number(newTier.minAmount),
        maxAmount: newTier.maxAmount.trim() === '' ? null : Number(newTier.maxAmount),
        rate: Number(newTier.rate),
      }),
    onSuccess: async () => {
      await invalidate();
      setAddOpen(false);
      setNewTier({ minAmount: '', maxAmount: '', rate: '' });
    },
    onError: (e) => alert(errMessage(e)),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, rate }: { id: number; rate: number }) => updateCryptoRate(token, id, rate),
    onSuccess: async () => {
      await invalidate();
      setEditId(null);
      setEditRate('');
    },
    onError: (e) => alert(errMessage(e)),
  });

  const deactivateMut = useMutation({
    mutationFn: (id: number) => deactivateCryptoRate(token, id),
    onSuccess: async () => { await invalidate(); },
    onError: (e) => alert(errMessage(e)),
  });

  const startEdit = (t: CryptoRateTier) => {
    const id = Number(t.id);
    if (!Number.isFinite(id)) {
      alert('Invalid tier id');
      return;
    }
    setEditId(id);
    setEditRate(String(num(t.rate)));
  };

  const saveEdit = () => {
    if (editId == null) return;
    const r = Number(editRate);
    if (Number.isNaN(r)) {
      alert('Invalid rate');
      return;
    }
    updateMut.mutate({ id: Number(editId), rate: r });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${historyOpen ? 'bg-[#147341] text-white border-[#147341]' : 'bg-white text-gray-700 border-gray-300'}`}
          >
            {historyOpen ? 'Hide history' : 'Rate history'}
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[#147341] text-white"
          >
            Add tier
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TRANSACTION_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTxTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${txTab === t ? 'bg-[#147341] text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
          >
            {TRANSACTION_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {txTab === 'GIFT_CARD_BUY' && (
        <p className="text-xs text-gray-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
          Tiers apply to <span className="font-medium">USD notional</span> (unit price × quantity) for USD-priced Reloadly gift cards; customers pay{' '}
          <span className="font-mono">usdNotional × rate</span> NGN from fiat before Reloadly is charged.
        </p>
      )}

      {historyOpen && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 max-h-64 overflow-auto">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Recent changes — {TRANSACTION_TYPE_LABELS[txTab]} ({txTab})
          </p>
          {historyLoading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : (
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
              {historyRows.length === 0 ? 'No history rows.' : JSON.stringify(historyRows, null, 2)}
            </pre>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-gray-500">Loading rates…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-medium">
                  <th className="px-4 py-3">USD min</th>
                  <th className="px-4 py-3">USD max</th>
                  <th className="px-4 py-3">NGN per $1</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3 w-48">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">{num(row.minAmount)}</td>
                    <td className="px-4 py-3">{row.maxAmount == null ? '∞' : num(row.maxAmount)}</td>
                    <td className="px-4 py-3">
                      {editId === Number(row.id) ? (
                        <input
                          type="number"
                          step="any"
                          className="w-28 px-2 py-1 border border-gray-300 rounded"
                          value={editRate}
                          onChange={(e) => setEditRate(e.target.value)}
                        />
                      ) : (
                        <span className="font-medium">{num(row.rate)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{row.isActive ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 space-x-2">
                      {editId === Number(row.id) ? (
                        <>
                          <button type="button" className="text-[#147341] hover:underline" onClick={saveEdit} disabled={updateMut.isPending}>
                            Save
                          </button>
                          <button type="button" className="text-gray-600 hover:underline" onClick={() => setEditId(null)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" className="text-[#147341] hover:underline" onClick={() => startEdit(row)}>
                            Edit rate
                          </button>
                          {row.isActive && (
                            <button
                              type="button"
                              className="text-red-600 hover:underline"
                              onClick={() => {
                                const id = Number(row.id);
                                if (!Number.isFinite(id)) {
                                  alert('Invalid tier id');
                                  return;
                                }
                                if (window.confirm('Deactivate this tier?')) deactivateMut.mutate(id);
                              }}
                              disabled={deactivateMut.isPending}
                            >
                              Deactivate
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tiers.length === 0 && !isLoading && (
          <p className="p-6 text-center text-gray-500">No tiers for {TRANSACTION_TYPE_LABELS[txTab]}.</p>
        )}
      </div>

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Add tier — {TRANSACTION_TYPE_LABELS[txTab]}</h3>
            <label className="block text-sm">
              <span className="text-gray-600">Min USD</span>
              <input
                type="number"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={newTier.minAmount}
                onChange={(e) => setNewTier((s) => ({ ...s, minAmount: e.target.value }))}
              />
            </label>
            <label className="block text-sm">
              <span className="text-gray-600">Max USD (empty = unlimited)</span>
              <input
                type="number"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={newTier.maxAmount}
                onChange={(e) => setNewTier((s) => ({ ...s, maxAmount: e.target.value }))}
              />
            </label>
            <label className="block text-sm">
              <span className="text-gray-600">NGN per $1</span>
              <input
                type="number"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={newTier.rate}
                onChange={(e) => setNewTier((s) => ({ ...s, rate: e.target.value }))}
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="px-4 py-2 rounded-lg border border-gray-300" onClick={() => setAddOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-[#147341] text-white disabled:opacity-50"
                disabled={createMut.isPending}
                onClick={() => createMut.mutate()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoRatesSettings;
