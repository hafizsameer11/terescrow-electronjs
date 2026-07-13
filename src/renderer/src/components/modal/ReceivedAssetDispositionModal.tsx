import React, { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sendFlowDisplayTicker, vendorMatchesAssetSymbol } from '@renderer/utils/masterWalletAssets';
import type { SendModalVendor } from '@renderer/components/modal/SendCryptoModal';
import {
  transactionTrackingSendToVendor,
  transactionTrackingSendToMasterWallet,
  transactionTrackingEstimateFee,
} from '@renderer/api/admin/transactionTracking';
import { ApiError } from '@renderer/api/customApiCall';
import { addThousandSeparator } from '@renderer/api/helper';
import { formatCryptoAmountFromUnknown } from '@renderer/utils/cryptoAmountSync';

export type DispositionModalTab = 'vendor' | 'master';

function vendorsForReceive(vendors: SendModalVendor[], receiveSymbolRaw: string): SendModalVendor[] {
  return vendors.filter((v) => vendorMatchesAssetSymbol(v.currency, receiveSymbolRaw));
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  symbol: string;
  blockchain: string;
  fullReceiveAmount: string;
  receiveAmountUsd?: string;
  soldAmount?: string;
  soldAmountUsd?: string;
  userRetentionUsd?: string;
  /** Pre-loaded from tracking list/details (TronScan for USDT Tron). */
  initialOnChainBalance?: string | null;
  vendors: SendModalVendor[];
  token: string;
  canSubmit: boolean;
  blockReason?: string;
  defaultTab?: DispositionModalTab;
};

const ReceivedAssetDispositionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  transactionId,
  symbol,
  blockchain,
  fullReceiveAmount,
  receiveAmountUsd,
  soldAmount = '0',
  soldAmountUsd = '0',
  userRetentionUsd,
  initialOnChainBalance,
  vendors,
  token,
  canSubmit,
  blockReason,
  defaultTab = 'vendor',
}) => {
  const queryClient = useQueryClient();
  const displayTicker = useMemo(() => sendFlowDisplayTicker(symbol) || symbol, [symbol]);
  const eligibleVendors = useMemo(() => vendorsForReceive(vendors, symbol), [vendors, symbol]);

  const [tab, setTab] = useState<DispositionModalTab>(defaultTab);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [previewAmount, setPreviewAmount] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setTab(defaultTab);
    setSelectedVendorId('');
    setPreviewAmount('');
    setFormError('');
  }, [isOpen, defaultTab]);

  const estimateTarget = tab === 'master' ? 'master' : 'vendor';
  const vendorIdNum = selectedVendorId ? Number(selectedVendorId) : undefined;

  const { data: feeEstimate, isFetching: estimateLoading, refetch: refetchEstimate } = useQuery({
    queryKey: ['disburse-fee-estimate', transactionId, estimateTarget, selectedVendorId, tab],
    queryFn: () =>
      transactionTrackingEstimateFee(token, transactionId, {
        target: estimateTarget,
        vendorId: tab === 'vendor' && vendorIdNum ? vendorIdNum : undefined,
      }),
    enabled: isOpen && !!transactionId && (tab === 'master' || (tab === 'vendor' && !!vendorIdNum)),
  });

  const invalidateTracking = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-transaction-tracking'] });
    queryClient.invalidateQueries({ queryKey: ['admin-transaction-tracking-details'] });
    queryClient.invalidateQueries({ queryKey: ['admin-transaction-tracking-steps'] });
  };

  const vendorMutation = useMutation({
    mutationFn: () => {
      const vid = Number(selectedVendorId);
      if (!Number.isFinite(vid) || vid < 1) throw new Error('Select a vendor.');
      return transactionTrackingSendToVendor(token, transactionId, { vendorId: vid });
    },
    onSuccess: () => {
      invalidateTracking();
      onClose();
    },
    onError: (err: unknown) => {
      setFormError(err instanceof ApiError ? err.message : 'Request failed');
    },
  });

  const masterMutation = useMutation({
    mutationFn: () => transactionTrackingSendToMasterWallet(token, transactionId, {}),
    onSuccess: () => {
      invalidateTracking();
      onClose();
    },
    onError: (err: unknown) => {
      setFormError(err instanceof ApiError ? err.message : 'Request failed');
    },
  });

  const applyMaxSold = () => {
    const amt = soldAmount && Number(soldAmount) > 0 ? soldAmount : soldAmountUsd;
    setPreviewAmount(amt || '');
  };

  if (!isOpen || !transactionId) return null;

  const busy = vendorMutation.isPending || masterMutation.isPending;
  const vendorDisabled = !canSubmit || eligibleVendors.length === 0;
  const masterDisabled = !canSubmit;
  const soldUsdNum = Number(soldAmountUsd) || 0;
  const recvUsdNum = Number(receiveAmountUsd) || 0;
  const chainLower = blockchain.toLowerCase();
  const isTronUsdt =
    (chainLower === 'tron' || chainLower === 'trx') &&
    (displayTicker.toUpperCase().includes('USDT') || symbol.toUpperCase().includes('USDT'));
  const liveOnChain =
    feeEstimate?.onChainDepositBalance != null && feeEstimate.onChainDepositBalance !== ''
      ? feeEstimate.onChainDepositBalance
      : initialOnChainBalance != null && initialOnChainBalance !== ''
        ? initialOnChainBalance
        : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[60] overflow-y-auto p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Disburse deposit</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none" aria-label="Close">
            &times;
          </button>
        </div>

        <div className="flex border-b">
          <button
            type="button"
            onClick={() => { setTab('vendor'); setFormError(''); }}
            className={`flex-1 py-2.5 text-sm font-medium ${tab === 'vendor' ? 'bg-[#147341] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
          >
            To vendor
          </button>
          <button
            type="button"
            onClick={() => { setTab('master'); setFormError(''); }}
            className={`flex-1 py-2.5 text-sm font-medium ${tab === 'master' ? 'bg-[#147341] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
          >
            Sweep to master
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <span className="text-gray-500 text-xs">Received</span>
              <p className="font-mono font-medium text-gray-900">{fullReceiveAmount || '—'}</p>
              {receiveAmountUsd != null && (
                <p className="text-xs text-gray-600">${addThousandSeparator(recvUsdNum)}</p>
              )}
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
              <span className="text-gray-600 text-xs">Sold on platform</span>
              <p className="font-mono font-medium text-gray-900">
                {soldUsdNum > 0 ? `$${addThousandSeparator(soldUsdNum)}` : '—'}
              </p>
              {Number(soldAmount) > 0 && (
                <p className="text-xs text-gray-600">{soldAmount} {displayTicker}</p>
              )}
            </div>
          </div>
          {userRetentionUsd != null && (
            <p className="text-xs text-gray-600">
              User retention (receive − sold): ${addThousandSeparator(Number(userRetentionUsd) || 0)}
            </p>
          )}
          {isTronUsdt && (
            <div className="rounded-lg border border-[#147341]/30 bg-green-50 px-3 py-2 text-sm">
              <span className="text-gray-600 text-xs block">On-chain at deposit (TronScan)</span>
              <p className="font-mono font-semibold text-[#147341]">
                {liveOnChain != null
                  ? `${formatCryptoAmountFromUnknown(liveOnChain)} ${displayTicker}`
                  : estimateLoading
                    ? 'Loading…'
                    : '—'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Live balance on the customer deposit address</p>
            </div>
          )}

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Preview amount (sold)</label>
              <input
                type="text"
                value={previewAmount}
                onChange={(e) => setPreviewAmount(e.target.value)}
                placeholder="For dry-run display only"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
              />
            </div>
            <button
              type="button"
              onClick={applyMaxSold}
              disabled={soldUsdNum <= 0 && !(Number(soldAmount) > 0)}
              className="px-3 py-2 text-sm font-medium border border-[#147341] text-[#147341] rounded-lg hover:bg-green-50 disabled:opacity-50"
              title="Fill with amount sold on platform (preview only)"
            >
              Max sold
            </button>
          </div>

          <button
            type="button"
            disabled={estimateLoading || (tab === 'vendor' && !vendorIdNum)}
            onClick={() => refetchEstimate()}
            className="w-full py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {estimateLoading ? 'Loading preview…' : 'Refresh dry-run preview'}
          </button>

          {feeEstimate && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm space-y-1">
              <p className="font-medium text-gray-800">Dry-run — {tab === 'master' ? 'master wallet' : 'vendor'}</p>
              <p className="text-xs text-gray-600 break-all">
                Destination: <span className="font-mono">{feeEstimate.toAddress}</span>
              </p>
              {isTronUsdt && liveOnChain != null && (
                <p className="text-xs font-medium text-[#147341]">
                  On-chain at deposit (TronScan): {formatCryptoAmountFromUnknown(liveOnChain)}{' '}
                  {feeEstimate.currency}
                </p>
              )}
              <p className="text-xs text-gray-600">
                Booked receive amount: {formatCryptoAmountFromUnknown(feeEstimate.amount)} {feeEstimate.currency}
              </p>
              {isTronUsdt &&
                liveOnChain != null &&
                formatCryptoAmountFromUnknown(liveOnChain) !==
                  formatCryptoAmountFromUnknown(feeEstimate.amount) && (
                  <p className="text-xs text-amber-800">
                    On-chain balance differs from booked receive — sweep moves the booked amount only.
                  </p>
                )}
              {feeEstimate.estimatedNetworkFee != null && (
                <p className="text-xs">
                  Est. network fee: {feeEstimate.estimatedNetworkFee}{' '}
                  {feeEstimate.estimatedNetworkFeeCurrency || ''}
                </p>
              )}
              {feeEstimate.note && <p className="text-xs text-amber-800">{feeEstimate.note}</p>}
            </div>
          )}

          {blockReason && (
            <div className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{blockReason}</div>
          )}
          {formError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{formError}</div>
          )}

          {tab === 'vendor' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vendor (currency matches {displayTicker})</label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  disabled={vendorDisabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#147341] disabled:bg-gray-100"
                >
                  <option value="">Select vendor…</option>
                  {eligibleVendors.map((v) => (
                    <option key={String(v.id)} value={String(v.id)}>
                      {v.name} — {v.network} / {v.currency}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                disabled={busy || vendorDisabled || !canSubmit}
                onClick={() => {
                  setFormError('');
                  vendorMutation.mutate();
                }}
                className="w-full py-3 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e] disabled:opacity-50"
              >
                {vendorMutation.isPending ? 'Submitting…' : 'Send to vendor'}
              </button>
            </>
          )}

          {tab === 'master' && (
            <button
              type="button"
              disabled={busy || masterDisabled || !canSubmit}
              onClick={() => {
                setFormError('');
                masterMutation.mutate();
              }}
              className="w-full py-3 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e] disabled:opacity-50"
            >
              {masterMutation.isPending ? 'Submitting…' : 'Confirm sweep to master'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceivedAssetDispositionModal;
