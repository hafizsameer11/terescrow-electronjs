import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createChangeNowSwap,
  getChangeNowAvailablePairs,
  getChangeNowCurrencies,
  getChangeNowInternalMap,
  getChangeNowNetworkFee,
  getChangeNowPayoutAddresses,
  getChangeNowQuote,
} from '@renderer/api/admin/changenow';
import type { SwapOrder, SwapSourceType } from '@renderer/types/changenow';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  sourceType: SwapSourceType;
  receiveTransactionId?: string;
  receiveAmount?: string;
  receiveCurrency?: string;
  receiveBlockchain?: string;
  masterWalletBlockchain?: string;
  /** If true, source/internal asset is fixed from parent context and cannot be changed. */
  lockSourceAsset?: boolean;
  onCreated?: (order: SwapOrder) => void;
};

const ChangeNowCreateSwapModal: React.FC<Props> = ({
  isOpen,
  onClose,
  token,
  sourceType,
  receiveTransactionId,
  receiveAmount,
  receiveCurrency,
  receiveBlockchain,
  masterWalletBlockchain = 'ethereum',
  lockSourceAsset = false,
  onCreated,
}) => {
  const queryClient = useQueryClient();
  const [mapId, setMapId] = useState<number | ''>('');
  const [toTicker, setToTicker] = useState('');
  const [toTickerSearch, setToTickerSearch] = useState('');
  const [amountFrom, setAmountFrom] = useState('');
  const [payoutAddressId, setPayoutAddressId] = useState<number | ''>('');
  const [refundAddress, setRefundAddress] = useState('');

  const { data: mapData } = useQuery({
    queryKey: ['admin-changenow-map-internal', token, sourceType],
    queryFn: () => getChangeNowInternalMap(token),
    enabled: isOpen,
  });
  const { data: payoutData } = useQuery({
    queryKey: ['admin-changenow-payout-addresses', token],
    queryFn: () => getChangeNowPayoutAddresses(token),
    enabled: isOpen,
  });
  const { data: currencyData } = useQuery({
    queryKey: ['admin-changenow-currencies', token],
    queryFn: () => getChangeNowCurrencies(token),
    enabled: isOpen,
  });

  const mapItems = mapData?.items ?? [];
  const payouts = (payoutData?.items ?? []).filter((p) => !p.archived);
  const currencies = currencyData?.items ?? [];
  const selectedMapItem = mapItems.find((m) => m.id === mapId);
  const fromTicker = selectedMapItem?.changenowTicker ?? '';
  const requestFromTicker = useMemo(() => {
    // Some partner environments reject usdterc20 and expect plain usdt.
    return String(fromTicker).toLowerCase() === 'usdterc20' ? 'usdt' : fromTicker;
  }, [fromTicker]);

  const norm = (s?: string | null) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const sameChain = (a?: string | null, b?: string | null) => {
    const x = norm(a);
    const y = norm(b);
    if (!x || !y) return true;
    const group = (v: string) => {
      if (['eth', 'ethereum', 'erc20'].includes(v)) return 'eth';
      if (['tron', 'trc20', 'trx'].includes(v)) return 'tron';
      if (['bsc', 'bnb', 'bnbsmartchain', 'binancesmartchain', 'bep20'].includes(v)) return 'bsc';
      if (['polygon', 'matic', 'polygonpos', 'erc20matic'].includes(v)) return 'polygon';
      return v;
    };
    return group(x) === group(y);
  };

  useEffect(() => {
    if (!isOpen) return;
    setToTicker('');
    setToTickerSearch('');
    setAmountFrom(receiveAmount ?? '');
    setRefundAddress('');
    setPayoutAddressId('');
    if (sourceType === 'received_asset' && receiveCurrency) {
      const match = mapItems.find(
        (m) =>
          norm(m.currency) === norm(receiveCurrency) &&
          sameChain(m.blockchain, receiveBlockchain)
      );
      setMapId(match?.id ?? '');
    } else {
      if (receiveCurrency) {
        const match = mapItems.find((m) => norm(m.currency) === norm(receiveCurrency) && sameChain(m.blockchain, receiveBlockchain));
        setMapId(match?.id ?? mapItems[0]?.id ?? '');
      } else {
        setMapId(mapItems[0]?.id ?? '');
      }
    }
  }, [isOpen, sourceType, receiveAmount, receiveCurrency, receiveBlockchain, mapItems]);

  const { data: pairsData } = useQuery({
    queryKey: ['admin-changenow-available-pairs', token, requestFromTicker],
    queryFn: () => getChangeNowAvailablePairs(token, { fromCurrency: requestFromTicker, flow: 'standard' }),
    enabled: isOpen && !!requestFromTicker,
  });

  const allowedToTickers = useMemo(() => {
    const fromPairs = pairsData?.items ?? [];
    const s = new Set(fromPairs.map((p) => (p.toCurrency || '').toLowerCase()).filter(Boolean));
    const raw = s.size === 0
      ? currencies.map((c) => c.ticker)
      : currencies.map((c) => c.ticker).filter((t) => s.has(t.toLowerCase()));
    // ChangeNOW currencies can include duplicate tickers across networks; keep first only.
    const seen = new Set<string>();
    const unique: string[] = [];
    raw.forEach((t) => {
      const key = String(t).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      unique.push(t);
    });
    return unique;
  }, [pairsData?.items, currencies]);
  const currencyByTicker = useMemo(() => {
    const m = new Map<string, { ticker: string; name: string }>();
    currencies.forEach((c) => m.set(String(c.ticker).toLowerCase(), { ticker: c.ticker, name: c.name || c.ticker }));
    return m;
  }, [currencies]);
  const filteredToTickers = useMemo(() => {
    const q = toTickerSearch.trim().toLowerCase();
    if (!q) return allowedToTickers;
    return allowedToTickers.filter((ticker) => {
      const c = currencyByTicker.get(String(ticker).toLowerCase());
      const name = (c?.name ?? ticker).toLowerCase();
      return ticker.toLowerCase().includes(q) || name.includes(q);
    });
  }, [allowedToTickers, toTickerSearch, currencyByTicker]);

  const { data: quoteData } = useQuery({
    queryKey: ['admin-changenow-quote', token, requestFromTicker, toTicker, amountFrom],
    queryFn: () => getChangeNowQuote(token, { fromTicker: requestFromTicker, toTicker, amount: amountFrom }),
    enabled: isOpen && !!requestFromTicker && !!toTicker && !!amountFrom,
  });
  const { data: feeData } = useQuery({
    queryKey: ['admin-changenow-network-fee', token, requestFromTicker, toTicker, amountFrom, quoteData?.fromNetwork, quoteData?.toNetwork],
    queryFn: () =>
      getChangeNowNetworkFee(token, {
        fromTicker: requestFromTicker,
        toTicker,
        amount: amountFrom,
        fromNetwork: quoteData?.fromNetwork ?? undefined,
        toNetwork: quoteData?.toNetwork ?? undefined,
      }),
    enabled: isOpen && !!requestFromTicker && !!toTicker && !!amountFrom,
  });

  const minAmount = quoteData?.minAmount ?? 0;
  const amountTooLow = !!amountFrom && Number(amountFrom) < Number(minAmount || 0);
  const canSubmit = !!fromTicker && !!toTicker && !!amountFrom && !!payoutAddressId && !amountTooLow;

  const createMutation = useMutation({
    mutationFn: async () => {
      if (sourceType === 'received_asset') {
        if (!receiveTransactionId) throw new Error('Missing receiveTransactionId');
        return createChangeNowSwap(token, {
          sourceType: 'received_asset',
          receiveTransactionId,
          fromTicker: requestFromTicker,
          toTicker,
          amountFrom,
          payoutAddressId: Number(payoutAddressId),
          refundAddress: refundAddress || undefined,
        });
      }
      if (!selectedMapItem) throw new Error('Select an internal asset');
      return createChangeNowSwap(token, {
        sourceType: 'master_wallet',
        masterWalletBlockchain,
        walletCurrencyId: selectedMapItem.id,
        fromTicker: requestFromTicker,
        toTicker,
        amountFrom,
        payoutAddressId: Number(payoutAddressId),
        refundAddress: refundAddress || undefined,
      });
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['admin-changenow-swaps'] });
      onCreated?.(order);
      onClose();
    },
    onError: (err: any) => {
      alert(err?.message || 'Failed to create swap.');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Swap via ChangeNOW</h2>
          <button type="button" onClick={onClose} className="text-2xl text-gray-500">&times;</button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Internal asset</label>
              {lockSourceAsset ? (
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                  {selectedMapItem
                    ? `${selectedMapItem.currency} (${selectedMapItem.blockchain}) → ${selectedMapItem.changenowTicker}`
                    : 'No source asset mapping found for this record'}
                </div>
              ) : (
                <select
                  value={mapId}
                  onChange={(e) => setMapId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select...</option>
                  {mapItems.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.currency} ({m.blockchain}) → {m.changenowTicker}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Target ticker</label>
              <input
                value={toTickerSearch}
                onChange={(e) => {
                  const q = e.target.value;
                  setToTickerSearch(q);
                  const exact = allowedToTickers.find((ticker) => {
                    const c = currencyByTicker.get(String(ticker).toLowerCase());
                    const name = (c?.name ?? '').toLowerCase();
                    const t = String(ticker).toLowerCase();
                    const v = q.trim().toLowerCase();
                    return v !== '' && (v === t || v === name || v === `${name} (${t})`);
                  });
                  if (exact) setToTicker(exact);
                }}
                placeholder="Search target asset..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
              />
              <select
                value={toTicker}
                onChange={(e) => setToTicker(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select...</option>
                {filteredToTickers.map((ticker, idx) => {
                  const c = currencyByTicker.get(String(ticker).toLowerCase());
                  return (
                    <option key={`${String(ticker).toLowerCase()}-${idx}`} value={ticker}>
                      {c?.name ?? ticker} ({ticker})
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Amount from</label>
              <input value={amountFrom} onChange={(e) => setAmountFrom(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Payout destination</label>
              <select
                value={payoutAddressId}
                onChange={(e) => setPayoutAddressId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select...</option>
                {payouts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label || `Address #${p.id}`} ({p.toNetworkHint || 'any'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Refund address (optional)</label>
            <input value={refundAddress} onChange={(e) => setRefundAddress(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>

          {sourceType === 'received_asset' && (
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
              Source: received asset {receiveTransactionId ? `(${receiveTransactionId})` : ''}.
            </div>
          )}

          <div className="rounded-lg border border-gray-200 p-3 text-sm space-y-1">
            <p><span className="text-gray-500">From ticker:</span> {requestFromTicker || '—'}</p>
            <p><span className="text-gray-500">Min amount:</span> {quoteData?.minAmount ?? '—'}</p>
            <p><span className="text-gray-500">Estimated receive:</span> {quoteData?.estimatedAmountTo ?? '—'}</p>
            <p><span className="text-gray-500">Networks:</span> {quoteData?.fromNetwork ?? '—'} → {quoteData?.toNetwork ?? '—'}</p>
            <p><span className="text-gray-500">Network fee:</span> {String((feeData as any)?.estimatedFee ?? '—')}</p>
            {amountTooLow && <p className="text-red-600">Amount must be at least {minAmount}.</p>}
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
            <button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={!canSubmit || createMutation.isPending}
              className="px-4 py-2 bg-[#147341] text-white rounded-lg disabled:opacity-50"
            >
              Create swap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeNowCreateSwapModal;
