import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@renderer/api/customApiCall';
import {
  createCryptoRate,
  deactivateCryptoRate,
  getCryptoRatesGrouped,
  getCryptoRatesHistory,
  setCryptoRateBase,
  updateCryptoRate,
} from '@renderer/api/admin/cryptoRates';
import type { CryptoRateTier, TransactionType } from '@renderer/types/cryptoRates';
import {
  CRYPTO_TRANSACTION_TYPES,
  effectiveRateFromBase,
  formatNairaRate,
  TRANSACTION_TYPE_LABELS,
  usesPercentRateTiers,
} from '@renderer/types/cryptoRates';
import CryptoDepositFeeSettings from './CryptoDepositFeeSettings';

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

function parseAdjInput(raw: string): number {
  const s = raw.trim().replace(/%$/, '');
  const n = Number(s);
  if (!Number.isFinite(n)) throw new Error('Invalid percent');
  return n;
}

function tierAdjustment(row: CryptoRateTier, base: number | null): number {
  if (row.adjustmentPercent != null && !Number.isNaN(num(row.adjustmentPercent))) {
    return num(row.adjustmentPercent);
  }
  const r = num(row.effectiveRate ?? row.rate);
  if (base != null && base > 0 && Number.isFinite(r)) {
    return ((r / base) - 1) * 100;
  }
  return 0;
}

function tierEffective(row: CryptoRateTier, base: number | null): number {
  const eff = num(row.effectiveRate ?? row.rate);
  if (Number.isFinite(eff)) return eff;
  if (base != null) return effectiveRateFromBase(base, tierAdjustment(row, base));
  return NaN;
}

type RateHistoryRow = {
  id?: number;
  minAmount?: string | number;
  maxAmount?: string | number | null;
  oldRate?: string | number | null;
  newRate?: string | number;
  changedBy?: number | null;
  createdAt?: string;
};

function formatHistoryDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export type CryptoRatesSettingsProps = {
  token: string;
  transactionTypes?: TransactionType[];
};

const CryptoRatesSettings: React.FC<CryptoRatesSettingsProps> = ({
  token,
  transactionTypes = CRYPTO_TRANSACTION_TYPES,
}) => {
  const queryClient = useQueryClient();
  const types = transactionTypes.length > 0 ? transactionTypes : CRYPTO_TRANSACTION_TYPES;
  const showDepositFee = types.includes('RECEIVE');
  const [txTab, setTxTab] = useState<TransactionType>(types[0]);
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editAdj, setEditAdj] = useState('');
  const [editRate, setEditRate] = useState('');
  const [baseRateInput, setBaseRateInput] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [newTier, setNewTier] = useState({ minAmount: '', maxAmount: '', rate: '', adjustmentPercent: '' });

  const percentMode = usesPercentRateTiers(txTab);

  const { data: groupedPayload, isLoading } = useQuery({
    queryKey: ['admin-crypto-rates-grouped', token],
    queryFn: () => getCryptoRatesGrouped(token),
    enabled: !!token,
  });

  const grouped = groupedPayload?.rates;
  const baseRates = groupedPayload?.baseRates ?? {};
  const baseRate =
    txTab === 'BUY' || txTab === 'SELL' ? (baseRates[txTab] ?? null) : null;

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
    if (!types.includes(txTab)) setTxTab(types[0]);
  }, [types, txTab]);

  useEffect(() => {
    setEditId(null);
  }, [txTab]);

  useEffect(() => {
    if (percentMode && baseRate != null) {
      setBaseRateInput(String(baseRate));
    } else if (!percentMode) {
      setBaseRateInput('');
    }
  }, [percentMode, baseRate, txTab]);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-crypto-rates-grouped'] });
    await queryClient.invalidateQueries({ queryKey: ['admin-crypto-rates-history'] });
  };

  const baseMut = useMutation({
    mutationFn: () => {
      if (txTab !== 'BUY' && txTab !== 'SELL') throw new Error('Invalid type');
      const b = Math.round(Number(baseRateInput));
      if (!Number.isFinite(b) || b <= 0) throw new Error('Enter a valid whole-number base rate');
      return setCryptoRateBase(token, { transactionType: txTab, baseRate: b });
    },
    onSuccess: async () => {
      await invalidate();
    },
    onError: (e) => alert(errMessage(e)),
  });

  const createMut = useMutation({
    mutationFn: () => {
      const body = {
        transactionType: txTab,
        minAmount: Number(newTier.minAmount),
        maxAmount: newTier.maxAmount.trim() === '' ? null : Number(newTier.maxAmount),
      };
      if (percentMode) {
        return createCryptoRate(token, {
          ...body,
          adjustmentPercent: parseAdjInput(newTier.adjustmentPercent || '0'),
        });
      }
      return createCryptoRate(token, {
        ...body,
        rate: Math.round(Number(newTier.rate)),
      });
    },
    onSuccess: async () => {
      await invalidate();
      setAddOpen(false);
      setNewTier({ minAmount: '', maxAmount: '', rate: '', adjustmentPercent: '' });
    },
    onError: (e) => alert(errMessage(e)),
  });

  const updateMut = useMutation({
    mutationFn: (payload: { id: number; rate?: number; adjustmentPercent?: number }) =>
      updateCryptoRate(token, payload.id, {
        rate: payload.rate,
        adjustmentPercent: payload.adjustmentPercent,
      }),
    onSuccess: async () => {
      await invalidate();
      setEditId(null);
      setEditRate('');
      setEditAdj('');
    },
    onError: (e) => alert(errMessage(e)),
  });

  const deactivateMut = useMutation({
    mutationFn: (id: number) => deactivateCryptoRate(token, id),
    onSuccess: async () => {
      await invalidate();
    },
    onError: (e) => alert(errMessage(e)),
  });

  const startEdit = (t: CryptoRateTier) => {
    const id = Number(t.id);
    if (!Number.isFinite(id)) {
      alert('Invalid tier id');
      return;
    }
    setEditId(id);
    if (percentMode) {
      setEditAdj(String(tierAdjustment(t, baseRate)));
    } else {
      setEditRate(String(num(t.rate)));
    }
  };

  const saveEdit = () => {
    if (editId == null) return;
    if (percentMode) {
      try {
        const adj = parseAdjInput(editAdj);
        updateMut.mutate({ id: Number(editId), adjustmentPercent: adj });
      } catch {
        alert('Invalid adjustment %');
      }
      return;
    }
    const r = Math.round(Number(editRate));
    if (Number.isNaN(r)) {
      alert('Invalid rate');
      return;
    }
    updateMut.mutate({ id: Number(editId), rate: r });
  };

  const previewEffective = (adjStr: string): string => {
    const b = baseRate ?? Math.round(Number(baseRateInput));
    if (!Number.isFinite(b) || b <= 0) return '—';
    try {
      return formatNairaRate(effectiveRateFromBase(b, parseAdjInput(adjStr)));
    } catch {
      return '—';
    }
  };

  return (
    <div className="space-y-4">
      {showDepositFee && <CryptoDepositFeeSettings token={token} />}

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

      {types.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
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
      )}

      {percentMode && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <p className="text-sm text-gray-700">
            Set one <span className="font-medium">base NGN per $1</span> for {TRANSACTION_TYPE_LABELS[txTab]}. Each USD
            range uses an adjustment % on that base (e.g. <span className="font-mono">-5</span> or{' '}
            <span className="font-mono">-5%</span> lowers the rate; <span className="font-mono">10</span> raises it).
            Only the base rate needs frequent updates.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="block text-sm">
              <span className="text-gray-600">Base NGN per $1</span>
              <input
                type="number"
                step="1"
                min="1"
                className="mt-1 w-40 px-3 py-2 border border-gray-300 rounded-lg"
                value={baseRateInput}
                onChange={(e) => setBaseRateInput(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-[#147341] text-white text-sm font-medium disabled:opacity-50"
              disabled={baseMut.isPending}
              onClick={() => baseMut.mutate()}
            >
              Save base rate
            </button>
          </div>
          {baseRate == null && (
            <p className="text-xs text-amber-700">Save a base rate before adding or editing tiers.</p>
          )}
        </div>
      )}

      {txTab === 'GIFT_CARD_BUY' && (
        <p className="text-xs text-gray-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
          Tiers apply to <span className="font-medium">USD notional</span> (unit price × quantity) for USD-priced
          Reloadly gift cards; customers pay <span className="font-mono">usdNotional × rate</span> NGN from fiat before
          Reloadly is charged.
        </p>
      )}

      {historyOpen && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <p className="text-sm font-medium text-gray-700 px-4 pt-4 pb-2">
            Recent changes — {TRANSACTION_TYPE_LABELS[txTab]} ({txTab})
          </p>
          {historyLoading ? (
            <p className="text-sm text-gray-500 px-4 pb-4">Loading…</p>
          ) : (historyRows as RateHistoryRow[]).length === 0 ? (
            <p className="text-sm text-gray-500 px-4 pb-4">No history yet.</p>
          ) : (
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-t border-b border-gray-200 bg-gray-50 text-gray-600 text-xs uppercase">
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">USD min</th>
                    <th className="px-4 py-2">USD max</th>
                    <th className="px-4 py-2">Old NGN/$</th>
                    <th className="px-4 py-2">New NGN/$</th>
                  </tr>
                </thead>
                <tbody>
                  {(historyRows as RateHistoryRow[]).map((row) => (
                    <tr key={row.id ?? `${row.createdAt}-${row.newRate}`} className="border-b border-gray-100">
                      <td className="px-4 py-2 whitespace-nowrap text-gray-600">{formatHistoryDate(row.createdAt)}</td>
                      <td className="px-4 py-2">{num(row.minAmount)}</td>
                      <td className="px-4 py-2">{row.maxAmount == null ? '∞' : num(row.maxAmount)}</td>
                      <td className="px-4 py-2">{row.oldRate == null ? '—' : formatNairaRate(row.oldRate)}</td>
                      <td className="px-4 py-2 font-medium text-[#147341]">{formatNairaRate(row.newRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                  {percentMode ? (
                    <>
                      <th className="px-4 py-3">Adjustment %</th>
                      <th className="px-4 py-3">Effective NGN/$</th>
                    </>
                  ) : (
                    <th className="px-4 py-3">NGN per $1</th>
                  )}
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3 w-48">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">{num(row.minAmount)}</td>
                    <td className="px-4 py-3">{row.maxAmount == null ? '∞' : num(row.maxAmount)}</td>
                    {percentMode ? (
                      <>
                        <td className="px-4 py-3">
                          {editId === Number(row.id) ? (
                            <input
                              type="text"
                              className="w-24 px-2 py-1 border border-gray-300 rounded"
                              placeholder="e.g. -5"
                              value={editAdj}
                              onChange={(e) => setEditAdj(e.target.value)}
                            />
                          ) : (
                            <span className="font-medium">
                              {tierAdjustment(row, baseRate)}
                              {!Number.isNaN(tierAdjustment(row, baseRate)) ? '%' : ''}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#147341]">
                          {editId === Number(row.id)
                            ? previewEffective(editAdj)
                            : formatNairaRate(tierEffective(row, baseRate))}
                        </td>
                      </>
                    ) : (
                      <td className="px-4 py-3">
                        {editId === Number(row.id) ? (
                          <input
                            type="number"
                            step="1"
                            min="1"
                            className="w-28 px-2 py-1 border border-gray-300 rounded"
                            value={editRate}
                            onChange={(e) => setEditRate(e.target.value)}
                          />
                        ) : (
                          <span className="font-medium">{formatNairaRate(row.rate)}</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3">{row.isActive ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 space-x-2">
                      {editId === Number(row.id) ? (
                        <>
                          <button
                            type="button"
                            className="text-[#147341] hover:underline"
                            onClick={saveEdit}
                            disabled={updateMut.isPending}
                          >
                            Save
                          </button>
                          <button type="button" className="text-gray-600 hover:underline" onClick={() => setEditId(null)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" className="text-[#147341] hover:underline" onClick={() => startEdit(row)}>
                            {percentMode ? 'Edit %' : 'Edit rate'}
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
            {percentMode ? (
              <label className="block text-sm">
                <span className="text-gray-600">Adjustment % on base (e.g. 0, -5, 10%)</span>
                <input
                  type="text"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={newTier.adjustmentPercent}
                  onChange={(e) => setNewTier((s) => ({ ...s, adjustmentPercent: e.target.value }))}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Effective rate preview: {previewEffective(newTier.adjustmentPercent || '0')} NGN/$
                </p>
              </label>
            ) : (
              <label className="block text-sm">
                <span className="text-gray-600">NGN per $1</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={newTier.rate}
                  onChange={(e) => setNewTier((s) => ({ ...s, rate: e.target.value }))}
                />
              </label>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="px-4 py-2 rounded-lg border border-gray-300" onClick={() => setAddOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-[#147341] text-white disabled:opacity-50"
                disabled={createMut.isPending || (percentMode && baseRate == null)}
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
