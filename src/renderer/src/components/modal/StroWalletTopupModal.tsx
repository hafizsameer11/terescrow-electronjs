import { useEffect, useState } from 'react';
import type { MerchantsOverview } from '@renderer/api/admin/merchants';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  overview?: MerchantsOverview['strowallet'];
  onSubmit: (amount: number) => void;
  isSubmitting?: boolean;
};

export default function StroWalletTopupModal({ isOpen, onClose, overview, onSubmit, isSubmitting }: Props) {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (isOpen) setAmount('');
  }, [isOpen]);

  if (!isOpen) return null;

  const bank = overview?.topupBank;
  const hasBank = !!(bank?.bankCode && bank?.accountNumber);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!Number.isFinite(n) || n <= 0) return;
    onSubmit(n);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium text-gray-800">Top up StroWallet</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-sm text-gray-600">
            Sends a PalmPay merchant payout from your PalmPay balance to the StroWallet funding account.
          </p>

          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            <p className="font-medium text-gray-800">Destination account</p>
            {hasBank ? (
              <>
                <p className="text-gray-600">{bank?.bankName || bank?.bankCode}</p>
                <p className="font-mono text-gray-800">{bank?.accountNumber}</p>
                <p className="text-gray-600">{bank?.accountName || '—'}</p>
              </>
            ) : (
              <p className="text-amber-700">Configure StroWallet bank details first.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (NGN) *</label>
            <input
              required
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="50000"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasBank}
              className="px-4 py-2 bg-[#147341] text-white rounded-lg disabled:opacity-60"
            >
              {isSubmitting ? 'Processing…' : 'Send via PalmPay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
