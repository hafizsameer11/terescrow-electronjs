import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCryptoDepositFeeConfig,
  updateCryptoDepositFeeConfig,
} from '@renderer/api/admin/cryptoDepositFee';
import { toastApiError, toastSuccess } from '@renderer/utils/toast';

type Props = { token: string };

const CryptoDepositFeeSettings: React.FC<Props> = ({ token }) => {
  const queryClient = useQueryClient();
  const [isActive, setIsActive] = useState(true);
  const [feeByCurrencyId, setFeeByCurrencyId] = useState<Record<number, string>>({});
  const [currencySearch, setCurrencySearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-crypto-deposit-fee', token],
    queryFn: () => getCryptoDepositFeeConfig(token),
    enabled: !!token,
  });

  useEffect(() => {
    if (data) {
      setIsActive(data.isActive);
      const next: Record<number, string> = {};
      for (const c of data.currencies) {
        if (c.feePercent != null && c.feePercent > 0) {
          next[c.id] = String(c.feePercent);
        }
      }
      setFeeByCurrencyId(next);
    }
  }, [data]);

  const currencies = data?.currencies ?? [];

  const filteredCurrencies = useMemo(() => {
    const q = currencySearch.trim().toLowerCase();
    if (!q) return currencies;
    return currencies.filter(
      (c) =>
        c.displayLabel.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q) ||
        c.blockchain.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [currencies, currencySearch]);

  const configuredRules = useMemo(() => {
    return currencies
      .map((c) => {
        const raw = feeByCurrencyId[c.id] ?? '';
        const pct = Number(raw);
        if (!Number.isFinite(pct) || pct <= 0) return null;
        return { walletCurrencyId: c.id, feePercent: pct, displayLabel: c.displayLabel };
      })
      .filter(Boolean) as Array<{ walletCurrencyId: number; feePercent: number; displayLabel: string }>;
  }, [currencies, feeByCurrencyId]);

  const setFeeForCurrency = (id: number, value: string) => {
    setFeeByCurrencyId((prev) => {
      const trimmed = value.trim();
      if (!trimmed) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: value };
    });
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      updateCryptoDepositFeeConfig(token, {
        isActive,
        rules: configuredRules.map((r) => ({
          walletCurrencyId: r.walletCurrencyId,
          feePercent: r.feePercent,
        })),
      }),
    onSuccess: async () => {
      toastSuccess('Deposit service fees saved');
      await queryClient.invalidateQueries({ queryKey: ['admin-crypto-deposit-fee'] });
    },
    onError: (e) => toastApiError(e),
  });

  const exampleGross = 100;
  const firstRule = configuredRules[0];
  const exampleFee = firstRule ? (exampleGross * firstRule.feePercent) / 100 : 0;
  const exampleCredit = exampleGross - exampleFee;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Crypto deposit service fee</h3>
        <p className="text-sm text-gray-500 mt-1">
          Set a deposit service fee percentage per asset. Users see gross received, service fee, and net
          credited amount. Leave fee blank for assets that should be credited in full.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>

            <button
              type="button"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#147341] text-white disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving…' : 'Save fees'}
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                {configuredRules.length > 0
                  ? `${configuredRules.length} asset${configuredRules.length === 1 ? '' : 's'} with a fee configured`
                  : 'No fees configured — all deposits will be credited in full.'}
              </p>
              <input
                type="text"
                value={currencySearch}
                onChange={(e) => setCurrencySearch(e.target.value)}
                placeholder="Search assets…"
                className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-100">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left font-medium text-gray-700 px-3 py-2">Asset</th>
                    <th className="text-left font-medium text-gray-700 px-3 py-2 w-36">Fee %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCurrencies.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-3 py-4 text-gray-500">
                        No assets match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredCurrencies.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-800">
                          {c.displayLabel}
                          {c.isToken && (
                            <span className="ml-2 text-xs text-gray-400 uppercase">token</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={0.01}
                              value={feeByCurrencyId[c.id] ?? ''}
                              onChange={(e) => setFeeForCurrency(c.id, e.target.value)}
                              placeholder="—"
                              className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                            />
                            <span className="text-gray-500">%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {firstRule && (
        <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-sm text-gray-700 space-y-1">
          <p className="font-medium text-gray-900">Example for {firstRule.displayLabel} (USD value)</p>
          <p>Received: ${exampleGross.toFixed(2)}</p>
          <p>
            Service fee ({firstRule.feePercent}%): ${exampleFee.toFixed(2)}
          </p>
          <p>Credited to wallet: ${exampleCredit.toFixed(2)}</p>
          {configuredRules.length > 1 && (
            <p className="text-xs text-gray-500 pt-1">
              Other configured fees:{' '}
              {configuredRules
                .slice(1)
                .map((r) => `${r.displayLabel} (${r.feePercent}%)`)
                .join(', ')}
            </p>
          )}
        </div>
      )}

      {data?.updatedAt && (
        <p className="text-xs text-gray-400">Last updated: {new Date(data.updatedAt).toLocaleString()}</p>
      )}
    </div>
  );
};

export default CryptoDepositFeeSettings;
