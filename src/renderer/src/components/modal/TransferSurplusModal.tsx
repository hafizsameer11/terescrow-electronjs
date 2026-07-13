import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  transferAdminOnChainSurplus,
  type AdminUserAssetBalance,
} from '@renderer/api/admin/userBalances';
import { formatCryptoAmountFromUnknown } from '@renderer/utils/cryptoAmountSync';
import { toastApiError, toastSuccess } from '@renderer/utils/toast';

interface TransferSurplusModalProps {
  isOpen: boolean;
  userId: number;
  token: string;
  asset: AdminUserAssetBalance;
  ticker: string;
  surplusAmount: number;
  onClose: () => void;
}

const TransferSurplusModal: React.FC<TransferSurplusModalProps> = ({
  isOpen,
  userId,
  token,
  asset,
  ticker,
  surplusAmount,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState(() => formatCryptoAmountFromUnknown(surplusAmount));

  const mutation = useMutation({
    mutationFn: () =>
      transferAdminOnChainSurplus(token, userId, {
        currency: asset.currency,
        blockchain: asset.blockchain,
        toAddress: toAddress.trim(),
        amount: amount.trim() || undefined,
      }),
    onSuccess: (data) => {
      toastSuccess(`Sent ${data.amount} ${ticker}. Tx: ${data.txHash.slice(0, 12)}…`);
      queryClient.invalidateQueries({ queryKey: ['admin-user-wallet-detail', token, userId] });
      onClose();
    },
    onError: (err) => toastApiError(err, 'Transfer failed'),
  });

  if (!isOpen) return null;

  const maxSurplus = formatCryptoAmountFromUnknown(surplusAmount);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Transfer on-chain surplus</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {ticker} · Not recorded in system ledger
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-100" aria-label="Close">
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-sm text-amber-900">
            <p>
              <span className="font-medium">Surplus:</span>{' '}
              {maxSurplus} {ticker}
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Live at deposit ({formatCryptoAmountFromUnknown(asset.liveOnChainAtDeposit)}) minus recorded
              on-chain ({asset.onChainBalance}). Transfer is recorded; customer ledger balances are not changed.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
              placeholder={maxSurplus}
            />
            <button
              type="button"
              className="text-xs text-[#147341] mt-1 hover:underline"
              onClick={() => setAmount(maxSurplus)}
            >
              Use full surplus ({maxSurplus})
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination address</label>
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="Wallet address"
            />
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-white"
            disabled={mutation.isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !toAddress.trim()}
            className="flex-1 px-4 py-2 rounded-lg bg-[#147341] text-white text-sm font-medium hover:bg-[#0f5a32] disabled:opacity-50"
          >
            {mutation.isPending ? 'Sending…' : 'Send on-chain'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferSurplusModal;
