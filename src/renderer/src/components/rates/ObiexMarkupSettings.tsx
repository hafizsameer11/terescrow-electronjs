import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getObiexStatus, saveObiexSettings } from '@renderer/api/admin/obiex';
import { toastError, toastSuccess } from '@renderer/utils/toast';

type Props = {
  token: string;
};

const ObiexMarkupSettings: React.FC<Props> = ({ token }) => {
  const queryClient = useQueryClient();
  const [buyMarkup, setBuyMarkup] = useState('0');
  const [sellMarkup, setSellMarkup] = useState('0');
  const [buyFlatFee, setBuyFlatFee] = useState('0');
  const [sellFlatFee, setSellFlatFee] = useState('0');

  const statusQuery = useQuery({
    queryKey: ['obiexStatus'],
    queryFn: () => getObiexStatus(token),
    enabled: !!token,
    staleTime: 30_000,
    retry: false,
  });

  const configured = !!statusQuery.data?.configured;
  const active = !!statusQuery.data?.settings?.isActive && configured;

  useEffect(() => {
    const s = statusQuery.data?.settings;
    if (!s) return;
    setBuyMarkup(String(s.buyMarkupPercent ?? 0));
    setSellMarkup(String(s.sellMarkupPercent ?? 0));
    setBuyFlatFee(String(s.buyFlatFeeNgn ?? 0));
    setSellFlatFee(String(s.sellFlatFeeNgn ?? 0));
  }, [
    statusQuery.data?.settings?.buyMarkupPercent,
    statusQuery.data?.settings?.sellMarkupPercent,
    statusQuery.data?.settings?.buyFlatFeeNgn,
    statusQuery.data?.settings?.sellFlatFeeNgn,
  ]);

  const saveMutation = useMutation({
    mutationFn: () =>
      saveObiexSettings(token, {
        buyMarkupPercent: parseFloat(buyMarkup) || 0,
        sellMarkupPercent: parseFloat(sellMarkup) || 0,
        buyFlatFeeNgn: Math.max(0, parseFloat(buyFlatFee) || 0),
        sellFlatFeeNgn: Math.max(0, parseFloat(sellFlatFee) || 0),
      }),
    onSuccess: () => {
      toastSuccess('Obiex fees saved.');
      queryClient.invalidateQueries({ queryKey: ['obiexStatus'] });
    },
    onError: (e: any) => toastError(e?.message || 'Could not save Obiex fees'),
  });

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
        Obiex is not configured on the server. Flat fees and % markup apply once Obiex API is connected and
        active.
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-sky-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-sky-100 bg-sky-50/60">
        <h2 className="text-lg font-semibold text-gray-900">Obiex buy / sell fees</h2>
        <p className="text-sm text-gray-600 mt-1">
          Flat NGN fee plus % markup. Net admin profit/loss is recorded after Obiex deposit or withdraw fees.
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
        <p className="text-xs text-gray-500 mt-2">
          Example buy: user pays ₦10,200 with <strong>₦200 flat</strong> + <strong>1%</strong> → ₦200 flat kept,
          then 1% on ₦10,000. Provider deposit fee is subtracted for net P&L.
        </p>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Buy flat fee (₦)</label>
          <p className="text-xs text-gray-500 mb-2">Taken from user debit before % markup.</p>
          <input
            type="number"
            min={0}
            step="1"
            value={buyFlatFee}
            onChange={(e) => setBuyFlatFee(e.target.value)}
            className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Sell flat fee (₦)</label>
          <p className="text-xs text-gray-500 mb-2">Deducted from user credit after % markup.</p>
          <input
            type="number"
            min={0}
            step="1"
            value={sellFlatFee}
            onChange={(e) => setSellFlatFee(e.target.value)}
            className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Buy markup %</label>
          <p className="text-xs text-gray-500 mb-2">Positive = user pays more NGN for the same crypto.</p>
          <input
            type="number"
            step="0.01"
            value={buyMarkup}
            onChange={(e) => setBuyMarkup(e.target.value)}
            className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Sell markup %</label>
          <p className="text-xs text-gray-500 mb-2">Positive = user receives less NGN (platform keep).</p>
          <input
            type="number"
            step="0.01"
            value={sellMarkup}
            onChange={(e) => setSellMarkup(e.target.value)}
            className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
          />
        </div>
      </div>

      <div className="px-5 pb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="px-4 py-2 rounded-lg bg-sky-700 text-white text-sm font-medium hover:bg-sky-800 disabled:opacity-60"
        >
          {saveMutation.isPending ? 'Saving…' : 'Save Obiex fees'}
        </button>
        <p className="text-xs text-gray-500">
          Buy ₦{Number(statusQuery.data?.settings?.buyFlatFeeNgn ?? 0).toLocaleString()} +{' '}
          {Number(statusQuery.data?.settings?.buyMarkupPercent ?? 0)}% · Sell ₦
          {Number(statusQuery.data?.settings?.sellFlatFeeNgn ?? 0).toLocaleString()} +{' '}
          {Number(statusQuery.data?.settings?.sellMarkupPercent ?? 0)}%
        </p>
      </div>
    </div>
  );
};

export default ObiexMarkupSettings;
