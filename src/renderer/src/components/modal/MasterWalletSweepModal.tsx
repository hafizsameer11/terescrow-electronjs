import React, { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  executeDepositSweep,
  getDepositSweepPreview,
  type DepositSweepPreview,
  type DepositSweepTarget,
} from '@renderer/api/admin/masterWallet';
import { vendorMatchesAssetSymbol } from '@renderer/utils/masterWalletAssets';
import { ApiError } from '@renderer/api/customApiCall';
import { addThousandSeparator } from '@renderer/api/helper';
import { formatCryptoAmountFromUnknown } from '@renderer/utils/cryptoAmountSync';

function parseCryptoNum(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** Only surface on-chain when deposit address holds less than booked (sweep risk). */
function onChainLessThanBooked(booked: unknown, onChain: unknown): boolean {
  const b = parseCryptoNum(booked);
  const o = parseCryptoNum(onChain);
  if (b == null || o == null) return false;
  return o < b;
}

type AssetOption = {
  /** Unique per row (currency + network), not symbol alone. */
  id: string;
  symbol: string;
  blockchain?: string;
  displayLabel: string;
};

type VendorOption = { id: number | string; name: string; currency: string; network?: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  assets: AssetOption[];
  vendors?: VendorOption[];
  /** False for agents (vendors API is admin-only). */
  allowVendorTarget?: boolean;
  initialAssetId?: string;
  onSuccess?: () => void;
};

const MasterWalletSweepModal: React.FC<Props> = ({
  isOpen,
  onClose,
  token,
  assets,
  vendors = [],
  allowVendorTarget = true,
  initialAssetId,
  onSuccess,
}) => {
  const sortedAssets = useMemo(
    () => [...assets].sort((a, b) => a.displayLabel.localeCompare(b.displayLabel)),
    [assets]
  );

  const [assetKey, setAssetKey] = useState('');
  const [currency, setCurrency] = useState('');
  const [blockchain, setBlockchain] = useState('');
  const [target, setTarget] = useState<DepositSweepTarget>('master');
  const [vendorId, setVendorId] = useState('');
  const [preview, setPreview] = useState<DepositSweepPreview | null>(null);
  const [error, setError] = useState('');

  const selectedAsset = useMemo(
    () => sortedAssets.find((a) => a.id === assetKey) ?? sortedAssets[0],
    [sortedAssets, assetKey]
  );

  const eligibleVendors = useMemo(
    () =>
      selectedAsset
        ? vendors.filter((v) => vendorMatchesAssetSymbol(v.currency, selectedAsset.symbol))
        : [],
    [vendors, selectedAsset]
  );

  const applyAsset = (a: AssetOption) => {
    setAssetKey(a.id);
    setCurrency(a.symbol);
    setBlockchain(a.blockchain || '');
    setPreview(null);
    setVendorId('');
  };

  useEffect(() => {
    if (!isOpen) return;
    setPreview(null);
    setError('');
    setTarget('master');
    setVendorId('');
    const pick =
      (initialAssetId ? sortedAssets.find((a) => a.id === initialAssetId) : undefined) ?? sortedAssets[0];
    if (pick) applyAsset(pick);
  }, [isOpen, sortedAssets, initialAssetId]);

  useEffect(() => {
    if (!allowVendorTarget && target === 'vendor') {
      setTarget('master');
      setVendorId('');
      setPreview(null);
    }
  }, [allowVendorTarget, target]);

  const effectiveTarget: DepositSweepTarget = allowVendorTarget ? target : 'master';

  const sweepParams = () => ({
    currency,
    blockchain: blockchain || undefined,
    target: effectiveTarget,
    vendorId: effectiveTarget === 'vendor' && vendorId ? Number(vendorId) : undefined,
  });

  const dryRunMut = useMutation({
    mutationFn: () => getDepositSweepPreview(token, sweepParams()),
    onSuccess: (data) => {
      setPreview(data);
      setError('');
    },
    onError: (e: unknown) => {
      setPreview(null);
      setError(e instanceof ApiError ? e.message : 'Preview failed');
    },
  });

  const sweepMut = useMutation({
    mutationFn: () => executeDepositSweep(token, { ...sweepParams(), dryRun: false }),
    onSuccess: (data) => {
      setPreview(data.preview);
      onSuccess?.();
      if (data.summary.failed === 0) onClose();
    },
    onError: (e: unknown) => {
      setError(e instanceof ApiError ? e.message : 'Sweep failed');
    },
  });

  if (!isOpen) return null;

  const busy = dryRunMut.isPending || sweepMut.isPending;
  const canPreview =
    !!currency && (effectiveTarget === 'master' || (effectiveTarget === 'vendor' && vendorId));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Sweep user deposits</h2>
          <button type="button" onClick={onClose} className="text-gray-500 text-2xl leading-none" aria-label="Close">
            &times;
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <p className="text-sm text-gray-600">
            Moves <span className="font-medium">all customer deposits</span> still marked{' '}
            <span className="font-medium">in wallet</span> for the selected coin from their deposit addresses to your
            chosen destination. Always run <span className="font-medium">Preview</span> first.
          </p>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Destination</label>
            {allowVendorTarget ? (
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() => { setTarget('master'); setVendorId(''); setPreview(null); }}
                  className={`flex-1 py-2 text-sm font-medium ${target === 'master' ? 'bg-[#147341] text-white' : 'bg-white text-gray-700'}`}
                >
                  Master wallet
                </button>
                <button
                  type="button"
                  onClick={() => { setTarget('vendor'); setPreview(null); }}
                  className={`flex-1 py-2 text-sm font-medium border-l border-gray-300 ${target === 'vendor' ? 'bg-[#147341] text-white' : 'bg-white text-gray-700'}`}
                >
                  Vendor
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-700 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                Master wallet
              </p>
            )}
          </div>

          {allowVendorTarget && target === 'vendor' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vendor (must match coin)</label>
              <select
                value={vendorId}
                onChange={(e) => { setVendorId(e.target.value); setPreview(null); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select vendor…</option>
                {eligibleVendors.map((v) => (
                  <option key={String(v.id)} value={String(v.id)}>
                    {v.name} — {v.network ?? ''} / {v.currency}
                  </option>
                ))}
              </select>
              {eligibleVendors.length === 0 && selectedAsset && (
                <p className="text-xs text-amber-700 mt-1">
                  No vendor for {selectedAsset.displayLabel}. Choose <span className="font-medium">Master wallet</span>{' '}
                  or add a vendor under Settings → Vendors.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Coin / asset</label>
            <select
              value={assetKey}
              onChange={(e) => {
                const a = sortedAssets.find((x) => x.id === e.target.value);
                if (a) applyAsset(a);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {sortedAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.displayLabel}
                </option>
              ))}
            </select>
            {sortedAssets.length === 0 && (
              <p className="text-xs text-amber-700 mt-1">No assets loaded from master wallet.</p>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
          )}

          {preview && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">User deposits to sweep</span>
                <span className="font-medium">{preview.itemCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total user balance</span>
                <span className="font-mono font-medium">
                  {formatCryptoAmountFromUnknown(preview.totalAmount)} {preview.currency}
                </span>
              </div>
              {onChainLessThanBooked(preview.totalAmount, preview.totalOnChainAmount) && (
                <div className="flex justify-between">
                  <span className="text-amber-800">On-chain at deposits (less than booked)</span>
                  <span className="font-mono font-medium text-amber-800">
                    {formatCryptoAmountFromUnknown(preview.totalOnChainAmount)} {preview.currency}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Total (USD)</span>
                <span className="font-medium">${addThousandSeparator(Number(preview.totalAmountUsd) || 0)}</span>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Destination ({preview.destinationType})</span>
                <p className="text-xs font-medium text-gray-800">{preview.destinationLabel}</p>
                <p className="font-mono text-xs text-gray-700 break-all">{preview.destinationAddress || '—'}</p>
              </div>
              {preview.items.length > 0 && (
                <div className="max-h-32 overflow-y-auto border-t border-gray-200 pt-2 mt-2">
                  {preview.items.slice(0, 8).map((it) => (
                    <p key={it.receiveTransactionId} className="text-xs text-gray-600 truncate">
                      {it.customerName || 'Customer'} — {formatCryptoAmountFromUnknown(it.amount)}
                      {onChainLessThanBooked(it.amount, it.onChainAmount)
                        ? ` (on-chain: ${formatCryptoAmountFromUnknown(it.onChainAmount)} — insufficient)`
                        : ''}{' '}
                      (${it.amountUsd})
                    </p>
                  ))}
                  {preview.items.length > 8 && (
                    <p className="text-xs text-gray-500">+{preview.items.length - 8} more…</p>
                  )}
                </div>
              )}
            </div>
          )}

          {sweepMut.data && (
            <div className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              Batch {sweepMut.data.batchId}: {sweepMut.data.summary.succeeded}/{sweepMut.data.summary.total} succeeded
              <span className="block text-xs mt-1 text-green-700">
                Logged as user #{sweepMut.data.performedByUserId} ({sweepMut.data.performedByRole})
              </span>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex flex-wrap gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !canPreview}
            onClick={() => dryRunMut.mutate()}
            className="px-4 py-2 border border-[#147341] text-[#147341] rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {dryRunMut.isPending ? 'Previewing…' : 'Preview (dry-run)'}
          </button>
          <button
            type="button"
            disabled={busy || !canPreview || !preview || preview.itemCount === 0}
            onClick={() => {
              const dest = preview?.destinationLabel ?? 'destination';
              if (!window.confirm(`Sweep ${preview?.itemCount ?? 0} user deposit(s) to ${dest}?`)) return;
              sweepMut.mutate();
            }}
            className="px-4 py-2 bg-[#147341] text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {sweepMut.isPending ? 'Sweeping…' : 'Confirm sweep'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MasterWalletSweepModal;
