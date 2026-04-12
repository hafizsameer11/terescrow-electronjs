import React, { useState, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendFlowDisplayTicker, vendorMatchesAssetSymbol } from '@renderer/utils/masterWalletAssets';
import type { SendModalVendor } from '@renderer/components/modal/SendCryptoModal';
import {
  transactionTrackingSendToVendor,
  transactionTrackingSendToMasterWallet,
} from '@renderer/api/admin/transactionTracking';
import { ApiError } from '@renderer/api/customApiCall';

export type DispositionModalTab = 'vendor' | 'master';

/** Vendors whose currency matches the receive row (network validated server-side). */
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
  vendors: SendModalVendor[];
  token: string;
  canSubmit: boolean;
  blockReason?: string;
  /** Which tab to show when the modal opens (e.g. detail modal action). */
  defaultTab?: DispositionModalTab;
};

const ReceivedAssetDispositionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  transactionId,
  symbol,
  blockchain,
  fullReceiveAmount,
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
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setTab(defaultTab);
    setSelectedVendorId('');
    setFormError('');
  }, [isOpen, defaultTab]);

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

  if (!isOpen || !transactionId) return null;

  const busy = vendorMutation.isPending || masterMutation.isPending;
  const vendorDisabled = !canSubmit || eligibleVendors.length === 0;
  const masterDisabled = !canSubmit;

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
            To master wallet
          </button>
        </div>

        {tab === 'vendor' && (
          <div className="px-4 pt-3 pb-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-900 space-y-1">
            <p className="font-medium">Deposit → vendor</p>
            <p>
              <span className="font-mono">POST …/transaction-tracking/:txId/send-to-vendor</span> — signs from the{' '}
              <span className="font-medium">customer deposit</span> key. Body: <span className="font-mono">{'{ vendorId }'}</span>{' '}
              (omit <span className="font-mono">amount</span> for full receive).
            </p>
            <p className="text-gray-700 capitalize">
              Chain: {blockchain || '—'} · Asset: {displayTicker}
            </p>
          </div>
        )}

        {tab === 'master' && (
          <div className="px-4 pt-3 pb-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-800 space-y-1">
            <p className="font-medium">Deposit → master wallet</p>
            <p>
              <span className="font-mono">POST …/transaction-tracking/:txId/send-to-master-wallet</span> — same signing path as vendor; sends to{' '}
              <span className="font-medium">MasterWallet.address</span> for the normalized chain (e.g. ethereum, bsc, tron, polygon, bitcoin). Ledger:{' '}
              <span className="font-mono">disbursementType: master_wallet</span>, <span className="font-mono">vendorId: null</span>.
            </p>
            <p className="text-slate-600">
              Requires a <span className="font-medium">MasterWallet</span> row whose <span className="font-mono">blockchain</span> matches{' '}
              <span className="font-mono">normalizeBlockchain</span> for this receive; otherwise the API returns a clear not-configured error.
            </p>
            <p className="text-gray-700 capitalize">
              Chain: {blockchain || '—'} · Asset: {displayTicker}
            </p>
          </div>
        )}

        <div className="p-4 space-y-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
            <span className="text-gray-500">Receive amount</span>
            <p className="font-mono font-medium text-gray-900">{fullReceiveAmount || '—'}</p>
          </div>

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
                {eligibleVendors.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Add a vendor with matching currency under Settings → Vendors (network must fit the receive chain).
                  </p>
                )}
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
              {masterMutation.isPending ? 'Submitting…' : 'Send to master wallet'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceivedAssetDispositionModal;
