import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listBushaCoinFeeConfigs,
  saveBushaCoinFeeConfigs,
  type BushaCoinFeeConfigRow,
} from '@renderer/api/admin/busha';
import { toastError, toastSuccess } from '@renderer/utils/toast';

type Props = { token: string };

const BushaCoinFeeSettings: React.FC<Props> = ({ token }) => {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<BushaCoinFeeConfigRow[]>([]);

  const query = useQuery({
    queryKey: ['bushaCoinFeeConfigs'],
    queryFn: () => listBushaCoinFeeConfigs(token),
    enabled: !!token,
  });

  useEffect(() => {
    if (query.data?.rows) {
      setRows(query.data.rows.map((r) => ({ ...r })));
    }
  }, [query.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      saveBushaCoinFeeConfigs(
        token,
        rows.map((r) => ({
          currency: r.currency,
          depositFeePercent: Number(r.depositFeePercent) || 0,
          withdrawFeePercent: Number(r.withdrawFeePercent) || 0,
          isActive: r.isActive !== false,
        }))
      ),
    onSuccess: () => {
      toastSuccess('Coin fees saved.');
      queryClient.invalidateQueries({ queryKey: ['bushaCoinFeeConfigs'] });
    },
    onError: (err: any) => toastError(err?.message || 'Failed to save coin fees'),
  });

  const updateRow = (currency: string, patch: Partial<BushaCoinFeeConfigRow>) => {
    setRows((prev) => prev.map((r) => (r.currency === currency ? { ...r, ...patch } : r)));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-8">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Receive &amp; send fees</h3>
        <p className="text-sm text-gray-500 mt-1">
          Set a percent fee when a customer receives crypto or sends crypto. Leave at 0 for no fee.
          Fees are held in the customer&apos;s wallet balance and collected when they sell.
        </p>
      </div>

      {query.isLoading ? (
        <p className="text-gray-500 text-sm">Loading coins…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-3 pr-4 font-medium">Coin</th>
                <th className="py-3 pr-4 font-medium">Fee when they receive (%)</th>
                <th className="py-3 pr-4 font-medium">Fee when they send (%)</th>
                <th className="py-3 font-medium">On</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.currency} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-gray-800">{r.currency}</div>
                    <div className="text-xs text-gray-400">{r.name}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      value={r.depositFeePercent}
                      onChange={(e) =>
                        updateRow(r.currency, { depositFeePercent: parseFloat(e.target.value) || 0 })
                      }
                      className="w-28 border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      value={r.withdrawFeePercent}
                      onChange={(e) =>
                        updateRow(r.currency, { withdrawFeePercent: parseFloat(e.target.value) || 0 })
                      }
                      className="w-28 border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </td>
                  <td className="py-3">
                    <input
                      type="checkbox"
                      checked={r.isActive !== false}
                      onChange={(e) => updateRow(r.currency, { isActive: e.target.checked })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={saveMutation.isPending || rows.length === 0}
          onClick={() => saveMutation.mutate()}
          className="px-5 py-2.5 rounded-lg bg-[#147341] text-white font-medium hover:bg-green-800 disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Saving…' : 'Save fees'}
        </button>
      </div>
    </div>
  );
};

export default BushaCoinFeeSettings;
