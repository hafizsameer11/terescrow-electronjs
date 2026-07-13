import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createChangeNowSwap,
  getChangeNowAvailablePairs,
  getChangeNowCurrencies,
  getChangeNowInternalMap,
  getChangeNowNetworkFee,
  getChangeNowQuote,
} from '@renderer/api/admin/changenow';
import { getMasterWalletAssets } from '@renderer/api/admin/masterWallet';
import { formatCryptoAmountFromUnknown } from '@renderer/utils/cryptoAmountSync';
import { normalizeApiWalletTableRow } from '@renderer/utils/masterWalletAssets';
import type { SwapOrder, SwapSourceType } from '@renderer/types/changenow';

export type SwapSourcePrefill = {
  currency?: string;
  blockchain?: string;
  masterWalletAddress?: string;
  availableBalance?: string;
};

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
  sourcePrefill?: SwapSourcePrefill;
  /** Only lock source for received-asset swaps from transaction tracking. */
  lockSourceAsset?: boolean;
  onCreated?: (order: SwapOrder) => void;
};

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
    if (['btc', 'bitcoin'].includes(v)) return 'btc';
    return v;
  };
  return group(x) === group(y);
};

function blockchainToMasterKey(blockchain?: string | null): string {
  const b = norm(blockchain);
  if (['eth', 'ethereum', 'erc20'].includes(b)) return 'ethereum';
  if (['bsc', 'bnb', 'bnbsmartchain', 'binancesmartchain', 'bep20'].includes(b)) return 'bsc';
  if (['polygon', 'matic', 'polygonpos'].includes(b)) return 'polygon';
  return String(blockchain || 'ethereum').trim().toLowerCase() || 'ethereum';
}

function formatAssetLabel(currency: string, blockchain?: string | null): string {
  const c = currency.trim();
  const chain = blockchain?.trim();
  if (!chain || norm(chain) === norm(c)) return c;
  return `${c} (${chain})`;
}

function shortAddress(addr: string): string {
  const a = addr.trim();
  if (a.length <= 16) return a;
  return `${a.slice(0, 8)}…${a.slice(-6)}`;
}

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
  sourcePrefill,
  lockSourceAsset = false,
  onCreated,
}) => {
  const queryClient = useQueryClient();
  const [mapId, setMapId] = useState<number | ''>('');
  const [toTicker, setToTicker] = useState('');
  const [toTickerSearch, setToTickerSearch] = useState('');
  const [amountFrom, setAmountFrom] = useState('');
  const [destinationWalletCurrencyId, setDestinationWalletCurrencyId] = useState<number | ''>('');
  const [formError, setFormError] = useState('');

  const sourceLocked = lockSourceAsset && sourceType === 'received_asset';

  const { data: mapData } = useQuery({
    queryKey: ['admin-changenow-map-internal', token, sourceType],
    queryFn: () => getChangeNowInternalMap(token),
    enabled: isOpen,
  });
  const { data: currencyData } = useQuery({
    queryKey: ['admin-changenow-currencies', token],
    queryFn: () => getChangeNowCurrencies(token),
    enabled: isOpen,
  });
  const { data: masterAssetsRaw = [] } = useQuery({
    queryKey: ['admin-master-wallet-assets-swap-modal', token],
    queryFn: () => getMasterWalletAssets(token),
    enabled: isOpen,
  });

  const mapItems = mapData?.items ?? [];
  const currencies = currencyData?.items ?? [];
  const masterWalletRows = useMemo(
    () => (masterAssetsRaw as any[]).map((a) => normalizeApiWalletTableRow(a)),
    [masterAssetsRaw]
  );
  const selectedMapItem = mapItems.find((m) => m.id === mapId);
  const fromTicker = selectedMapItem?.changenowTicker ?? '';

  const sourceWalletRow = useMemo(() => {
    if (!selectedMapItem) return null;
    return masterWalletRows.find((r) => String(r.rowKey) === String(selectedMapItem.id));
  }, [selectedMapItem, masterWalletRows]);

  const resolvedMasterBlockchain = useMemo(() => {
    if (sourceType === 'master_wallet') {
      return blockchainToMasterKey(
        selectedMapItem?.blockchain ?? sourceWalletRow?.blockchain ?? sourcePrefill?.blockchain ?? masterWalletBlockchain
      );
    }
    return masterWalletBlockchain;
  }, [sourceType, selectedMapItem?.blockchain, sourceWalletRow?.blockchain, sourcePrefill?.blockchain, masterWalletBlockchain]);

  const refundAddress = useMemo(() => {
    const fromWallet = sourceWalletRow?.address?.trim();
    if (fromWallet && fromWallet !== '—') return fromWallet;
    const prefilled = sourcePrefill?.masterWalletAddress?.trim();
    if (prefilled && prefilled !== '—') return prefilled;
    return '';
  }, [sourceWalletRow?.address, sourcePrefill?.masterWalletAddress]);

  const requestFromTicker = useMemo(() => {
    return String(fromTicker).toLowerCase() === 'usdterc20' ? 'usdt' : fromTicker;
  }, [fromTicker]);

  useEffect(() => {
    if (!isOpen) return;
    setToTicker('');
    setToTickerSearch('');
    setDestinationWalletCurrencyId('');
    setAmountFrom(receiveAmount ?? sourcePrefill?.availableBalance ?? '');
    if (sourceType === 'received_asset' && receiveCurrency) {
      const match = mapItems.find(
        (m) =>
          norm(m.currency) === norm(receiveCurrency) &&
          sameChain(m.blockchain, receiveBlockchain)
      );
      setMapId(match?.id ?? '');
    } else if (receiveCurrency) {
      const match = mapItems.find(
        (m) =>
          norm(m.currency) === norm(receiveCurrency) &&
          sameChain(m.blockchain, receiveBlockchain ?? sourcePrefill?.blockchain)
      );
      setMapId(match?.id ?? mapItems[0]?.id ?? '');
    } else {
      setMapId(mapItems[0]?.id ?? '');
    }
  }, [isOpen, sourceType, receiveAmount, receiveCurrency, receiveBlockchain, sourcePrefill, mapItems]);

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
    const fromKey = String(requestFromTicker).toLowerCase();
    const seen = new Set<string>();
    const unique: string[] = [];
    raw.forEach((t) => {
      const key = String(t).toLowerCase();
      if (seen.has(key) || key === fromKey) return;
      seen.add(key);
      unique.push(t);
    });
    return unique;
  }, [pairsData?.items, currencies, requestFromTicker]);

  const currencyByTicker = useMemo(() => {
    const m = new Map<string, { ticker: string; name: string; network?: string }>();
    currencies.forEach((c) =>
      m.set(String(c.ticker).toLowerCase(), { ticker: c.ticker, name: c.name || c.ticker, network: c.network })
    );
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

  const toTargetNetwork = useMemo(() => {
    if (quoteData?.toNetwork) return quoteData.toNetwork;
    if (!toTicker) return null;
    return currencyByTicker.get(String(toTicker).toLowerCase())?.network ?? null;
  }, [toTicker, currencyByTicker, quoteData?.toNetwork]);

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

  const destinationOptions = useMemo(() => {
    if (!toTicker) return [];
    const key = String(toTicker).toLowerCase();
    return mapItems
      .filter((m) => String(m.changenowTicker).toLowerCase() === key)
      .map((m) => {
        const row = masterWalletRows.find((r) => String(r.rowKey) === String(m.id));
        const address = row?.address?.trim() ?? '';
        return {
          walletCurrencyId: m.id,
          label: formatAssetLabel(m.currency, m.blockchain),
          address: address !== '—' ? address : '',
          blockchain: m.blockchain,
        };
      })
      .filter((d) => !!d.address);
  }, [toTicker, mapItems, masterWalletRows]);

  const selectedDestination = destinationOptions.find(
    (d) => d.walletCurrencyId === destinationWalletCurrencyId
  );

  useEffect(() => {
    if (!isOpen) return;
    setDestinationWalletCurrencyId('');
  }, [isOpen, toTicker]);

  useEffect(() => {
    if (!isOpen || !toTicker || destinationOptions.length === 0) return;
    const currentValid = destinationOptions.some((d) => d.walletCurrencyId === destinationWalletCurrencyId);
    if (currentValid) return;
    setDestinationWalletCurrencyId(destinationOptions[0].walletCurrencyId);
  }, [isOpen, destinationOptions, destinationWalletCurrencyId, toTicker]);

  const minAmount = quoteData?.minAmount ?? 0;
  const amountTooLow = !!amountFrom && Number(amountFrom) < Number(minAmount || 0);
  const canSubmit =
    !!fromTicker && !!toTicker && !!amountFrom && !!destinationWalletCurrencyId && !amountTooLow;

  const fromLabel = selectedMapItem
    ? formatAssetLabel(selectedMapItem.currency, selectedMapItem.blockchain)
    : '—';
  const toLabel = toTicker
    ? (() => {
        const c = currencyByTicker.get(String(toTicker).toLowerCase());
        return c ? `${c.name} (${c.ticker})` : toTicker;
      })()
    : '—';

  const availableBalance =
    sourceWalletRow?.masterBalance && sourceWalletRow.masterBalance !== '—'
      ? sourceWalletRow.masterBalance
      : sourcePrefill?.availableBalance ?? receiveAmount;
  const availableDisplay = availableBalance
    ? `${formatCryptoAmountFromUnknown(availableBalance)} ${selectedMapItem?.currency ?? ''}`.trim()
    : null;

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
          payoutWalletCurrencyId: Number(destinationWalletCurrencyId),
          refundAddress: refundAddress || undefined,
        });
      }
      if (!selectedMapItem) throw new Error('Select a source asset');
      return createChangeNowSwap(token, {
        sourceType: 'master_wallet',
        masterWalletBlockchain: resolvedMasterBlockchain,
        walletCurrencyId: selectedMapItem.id,
        fromTicker: requestFromTicker,
        toTicker,
        amountFrom,
        payoutWalletCurrencyId: Number(destinationWalletCurrencyId),
        refundAddress: refundAddress || undefined,
      });
    },
    onSuccess: (order) => {
      setFormError('');
      queryClient.invalidateQueries({ queryKey: ['admin-changenow-swaps'] });
      onCreated?.(order);
      onClose();
    },
    onError: (err: any) => {
      setFormError(err?.message || 'Failed to create swap.');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Swap via ChangeNOW</h2>
            <p className="text-sm text-gray-500 mt-0.5">Convert master wallet crypto to another asset</p>
          </div>
          <button type="button" onClick={onClose} className="text-2xl text-gray-500 leading-none">&times;</button>
        </div>

        <div className="p-4 space-y-5">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Swap from</label>
              {sourceLocked ? (
                <div className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 text-sm font-medium">
                  {selectedMapItem ? fromLabel : 'No mapping for this asset'}
                </div>
              ) : (
                <select
                  value={mapId}
                  onChange={(e) => setMapId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Choose asset…</option>
                  {mapItems.map((m) => (
                    <option key={m.id} value={m.id}>
                      {formatAssetLabel(m.currency, m.blockchain)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="pb-2.5 text-gray-400 text-lg font-light" aria-hidden>→</div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Swap to</label>
              <input
                value={toTickerSearch}
                onChange={(e) => setToTickerSearch(e.target.value)}
                placeholder="Filter assets…"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-1.5"
              />
              <select
                value={toTicker}
                onChange={(e) => {
                  const v = e.target.value;
                  setToTicker(v);
                  const c = currencyByTicker.get(String(v).toLowerCase());
                  setToTickerSearch(c ? `${c.name} (${c.ticker})` : v);
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Choose asset…</option>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount to swap</label>
            <input
              value={amountFrom}
              onChange={(e) => setAmountFrom(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
            />
            {availableDisplay && (
              <p className="text-xs text-gray-500 mt-1">
                Available on master wallet: <span className="font-medium text-gray-700">{availableDisplay}</span>
                {' · '}
                <button
                  type="button"
                  className="text-[#147341] hover:underline"
                  onClick={() => setAmountFrom(String(availableBalance))}
                >
                  Use max
                </button>
              </p>
            )}
            {amountTooLow && (
              <p className="text-xs text-red-600 mt-1">Minimum amount: {minAmount}</p>
            )}
          </div>

          {sourceType === 'master_wallet' && selectedMapItem && (
            <div className="rounded-lg border border-[#147341]/20 bg-[#f0faf4] p-3 text-sm space-y-1.5">
              <p className="font-medium text-[#147341]">Sending from master wallet</p>
              <p className="text-gray-700">
                <span className="text-gray-500">Network:</span>{' '}
                {selectedMapItem.blockchain || resolvedMasterBlockchain}
              </p>
              {refundAddress ? (
                <p className="text-gray-700 break-all">
                  <span className="text-gray-500">Refund address:</span>{' '}
                  <span title={refundAddress}>{refundAddress}</span>
                </p>
              ) : (
                <p className="text-amber-700 text-xs">Loading master wallet address…</p>
              )}
            </div>
          )}

          {sourceType === 'received_asset' && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
              Source: received deposit{receiveTransactionId ? ` · ${receiveTransactionId.slice(0, 12)}…` : ''}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Receive in master wallet
            </label>
            {!toTicker ? (
              <p className="text-sm text-gray-500 px-3 py-2.5 border border-dashed border-gray-300 rounded-lg">
                Choose a swap-to asset first
              </p>
            ) : destinationOptions.length === 0 ? (
              <p className="text-sm text-amber-700 px-3 py-2.5 border border-amber-200 bg-amber-50 rounded-lg">
                No master wallet configured for {toLabel}. Set up the master wallet for this asset on Master Wallet page.
              </p>
            ) : (
              <>
                <select
                  value={destinationWalletCurrencyId}
                  onChange={(e) => setDestinationWalletCurrencyId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Choose master wallet…</option>
                  {destinationOptions.map((d) => (
                    <option key={d.walletCurrencyId} value={d.walletCurrencyId}>
                      {d.label} · {shortAddress(d.address)}
                    </option>
                  ))}
                </select>
                {selectedDestination && (
                  <p className="text-xs text-gray-500 mt-1 break-all">
                    Funds will be sent to master wallet: {selectedDestination.address}
                  </p>
                )}
              </>
            )}
          </div>

          {(fromTicker || toTicker || amountFrom) && (
            <div className="rounded-lg border border-gray-200 p-3 text-sm space-y-1 bg-gray-50">
              <p className="font-medium text-gray-800 mb-1">Summary</p>
              <p>
                <span className="text-gray-500">You send:</span>{' '}
                {amountFrom || '—'} {(selectedMapItem?.currency ?? requestFromTicker) || '—'}
              </p>
              <p>
                <span className="text-gray-500">You receive ≈</span>{' '}
                {quoteData?.estimatedAmountTo ?? '—'} {toTicker || '—'}
              </p>
              <p className="text-xs text-gray-500">
                Networks: {quoteData?.fromNetwork ?? '—'} → {quoteData?.toNetwork ?? toTargetNetwork ?? '—'}
                {' · '}
                Fee: {String((feeData as any)?.estimatedFee ?? '—')}
              </p>
            </div>
          )}

          {formError ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={!canSubmit || createMutation.isPending}
              className="px-4 py-2 bg-[#147341] text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating…' : toTicker ? `Swap ${fromLabel} → ${toLabel}` : 'Create swap'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeNowCreateSwapModal;
