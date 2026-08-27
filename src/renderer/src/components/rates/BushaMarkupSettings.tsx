import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getBushaStatus, saveBushaSettings } from '@renderer/api/admin/busha';
import { toastError, toastSuccess } from '@renderer/utils/toast';

type Props = {
  token: string;
};

const BushaMarkupSettings: React.FC<Props> = ({ token }) => {
  const queryClient = useQueryClient();
  const [buyMarkup, setBuyMarkup] = useState('0');
  const [sellMarkup, setSellMarkup] = useState('0');

  const statusQuery = useQuery({
    queryKey: ['bushaStatus'],
    queryFn: () => getBushaStatus(token),
    enabled: !!token,
    staleTime: 30_000,
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

  const saveMutation = useMutation({
    mutationFn: () =>
      saveBushaSettings(token, {
        buyMarkupPercent: parseFloat(buyMarkup) || 0,
        sellMarkupPercent: parseFloat(sellMarkup) || 0,
      }),
    onSuccess: () => {
      toastSuccess('Buy/sell markup percentages updated.');
      queryClient.invalidateQueries({ queryKey: ['bushaStatus'] });
    },
    onError: (e: any) => {
      toastError(e?.message || 'Could not save markup');
    },
  });

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
          Platform buy/sell markup on Busha live rates
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
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Buy markup %</label>
          <p className="text-xs text-gray-500 mb-2">
            User pays more NGN / gets less crypto. Example: Busha ₦1,400 + 5% → effective ~₦1,470.
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
          <label className="block text-sm font-medium text-gray-800 mb-1">Sell markup %</label>
          <p className="text-xs text-gray-500 mb-2">
            User receives less NGN. Example: Busha ₦1,400 − 5% → user gets ~₦1,330 per USDT.
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
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="px-4 py-2 rounded-lg bg-[#147341] text-white text-sm font-medium hover:bg-[#0f5c33] disabled:opacity-60"
        >
          {saveMutation.isPending ? 'Saving…' : 'Save markup'}
        </button>
        <p className="text-xs text-gray-500">
          Current: buy {Number(statusQuery.data?.settings?.buyMarkupPercent ?? 0)}% · sell{' '}
          {Number(statusQuery.data?.settings?.sellMarkupPercent ?? 0)}%
        </p>
      </div>
    </div>
  );
};

export default BushaMarkupSettings;
