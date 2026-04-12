import React, { useState, useMemo, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendFlowDisplayTicker, vendorMatchesAssetSymbol } from '@renderer/utils/masterWalletAssets';
import type { SendModalVendor } from '@renderer/components/modal/SendCryptoModal';
import type { TrackingListItem } from '@renderer/data/transactionTrackingData';
import {
  transactionTrackingBulkSendToVendor,
  type BulkSendToVendorResponse,
} from '@renderer/api/admin/transactionTracking';
import { ApiError } from '@renderer/api/customApiCall';

const MAX_ITEMS = 100;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  rows: TrackingListItem[];
  vendors: SendModalVendor[];
  token: string;
};

const BulkSendToVendorModal: React.FC<Props> = ({ isOpen, onClose, rows, vendors, token }) => {
  const queryClient = useQueryClient();
  const [vendorId, setVendorId] = useState('');
  const [formError, setFormError] = useState('');
  const [lastResult, setLastResult] = useState<BulkSendToVendorResponse | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setLastResult(null);
      setVendorId('');
      setFormError('');
    }
  }, [isOpen]);

  const baseCurrency = useMemo(() => {
    if (rows.length === 0) return '';
    const first = sendFlowDisplayTicker(rows[0].currency).toUpperCase();
    const allSame = rows.every((r) => sendFlowDisplayTicker(r.currency).toUpperCase() === first);
    return allSame ? first : '';
  }, [rows]);

  const eligibleVendors = useMemo(() => {
    if (!baseCurrency || rows.length === 0) return [];
    return vendors.filter((v) => vendorMatchesAssetSymbol(v.currency, rows[0].currency));
  }, [vendors, rows, baseCurrency]);

  const mutation = useMutation({
    mutationFn: async () => {
      const vid = Number(vendorId);
      if (!Number.isFinite(vid) || vid < 1) throw new Error('Select a vendor.');
      if (rows.length > MAX_ITEMS) throw new Error(`Maximum ${MAX_ITEMS} items per request.`);
      if (!baseCurrency) throw new Error('All selected rows must share the same asset (currency).');
      return transactionTrackingBulkSendToVendor(token, {
        items: rows.map((r) => ({ receiveTransactionId: r.transactionId, vendorId: vid })),
      });
    },
    onSuccess: (data) => {
      setLastResult(data);
      queryClient.invalidateQueries({ queryKey: ['admin-transaction-tracking'] });
      queryClient.invalidateQueries({ queryKey: ['admin-transaction-tracking-details'] });
      queryClient.invalidateQueries({ queryKey: ['admin-transaction-tracking-steps'] });
    },
    onError: (err: unknown) => {
      setFormError(err instanceof ApiError ? err.message : 'Request failed');
    },
  });

  if (!isOpen) return null;

  const busy = mutation.isPending;
  const disabled = !baseCurrency || eligibleVendors.length === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[60] overflow-y-auto p-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-lg font-bold text-gray-800">{lastResult ? 'Bulk disbursement result' : 'Bulk send to vendor'}</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none" aria-label="Close">
            &times;
          </button>
        </div>

        {lastResult ? (
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            <p className="text-sm font-medium text-gray-800">
              {lastResult.summary.succeeded}/{lastResult.summary.total} succeeded · {lastResult.summary.failed} failed
            </p>
            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 sticky top-0">
                  <tr>
                    <th className="px-2 py-1">Receive ID</th>
                    <th className="px-2 py-1">OK</th>
                    <th className="px-2 py-1">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {lastResult.results.map((r) => (
                    <tr key={r.receiveTransactionId} className="border-t border-gray-100">
                      <td className="px-2 py-1 font-mono text-[10px] break-all">{r.receiveTransactionId}</td>
                      <td className="px-2 py-1">{r.success ? '✓' : '✗'}</td>
                      <td className="px-2 py-1 text-gray-700">
                        {r.success ? (r.data?.txHash ? truncate(r.data.txHash, 10) : '—') : (r.error ?? r.statusCode ?? '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e]"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="px-4 py-2 bg-amber-50 border-b text-xs text-amber-900 shrink-0">
              <span className="font-mono">POST …/transaction-tracking/bulk-send-to-vendor</span> — one disbursement per receive (max {MAX_ITEMS}
              ). Full amount per row; no rollback on partial failures.
            </div>

            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{rows.length}</span> receive(s) selected
                {baseCurrency ? (
                  <span className="text-gray-600"> · asset {baseCurrency}</span>
                ) : (
                  <span className="text-red-700"> — mixed currencies not allowed for one bulk.</span>
                )}
              </p>

              {formError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{formError}</div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vendor (all rows)</label>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  disabled={disabled}
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

              <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 sticky top-0">
                    <tr>
                      <th className="px-2 py-1">Transaction ID</th>
                      <th className="px-2 py-1">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.transactionId} className="border-t border-gray-100">
                        <td className="px-2 py-1 font-mono text-[10px]">{r.transactionId}</td>
                        <td className="px-2 py-1">{r.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                disabled={busy || disabled || rows.length === 0}
                onClick={() => {
                  setFormError('');
                  mutation.mutate();
                }}
                className="w-full py-3 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e] disabled:opacity-50"
              >
                {busy ? 'Running bulk…' : 'Run bulk disbursement'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

function truncate(s: string, n: number) {
  if (!s || s.length <= n * 2 + 3) return s;
  return `${s.slice(0, n)}…${s.slice(-n)}`;
}

export default BulkSendToVendorModal;
