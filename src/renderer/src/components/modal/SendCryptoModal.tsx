import React, { useState, useEffect, useMemo } from 'react';
import { VENDOR_NETWORKS } from '@renderer/data/vendorData';
import { sendFlowDisplayTicker, vendorMatchesAssetSymbol } from '@renderer/utils/masterWalletAssets';

export type SendModalVendor = {
  id: string | number;
  name: string;
  network: string;
  currency: string;
  walletAddress: string;
};

interface SendCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  recipientName?: string;
  vendors?: SendModalVendor[];
  /** Master wallet outflows use disburse wording. */
  variant?: 'send' | 'disburse';
  onProceed?: (data: { address: string; amountCrypto: string; amountDollar: string; network: string }) => void;
}

type RecipientMode = 'vendor' | 'manual';

const SendCryptoModal: React.FC<SendCryptoModalProps> = ({
  isOpen,
  onClose,
  symbol,
  recipientName = '',
  vendors = [],
  variant = 'send',
  onProceed,
}) => {
  const displayTicker = useMemo(() => sendFlowDisplayTicker(symbol) || symbol, [symbol]);

  /** Disbursement: any vendor. Send: only vendors whose currency matches the asset. */
  const vendorsForSelect = useMemo(() => {
    if (variant === 'disburse') return vendors;
    return vendors.filter((v) => vendorMatchesAssetSymbol(v.currency, symbol));
  }, [variant, vendors, symbol]);

  const [recipientMode, setRecipientMode] = useState<RecipientMode>('manual');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState('');
  const [amountCrypto, setAmountCrypto] = useState('0.0023');
  const [amountDollar, setAmountDollar] = useState('$25,000');
  const [network, setNetwork] = useState('Ethereum');

  useEffect(() => {
    if (!isOpen) return;
    setAmountCrypto('0.0023');
    setAmountDollar('$25,000');
    setNetwork('Ethereum');
    setSelectedVendorId('');
    setWalletAddress('');
    const list = variant === 'disburse' ? vendors : vendors.filter((v) => vendorMatchesAssetSymbol(v.currency, symbol));
    setRecipientMode(list.length > 0 ? 'vendor' : 'manual');
  }, [isOpen, symbol, vendors, variant]);

  useEffect(() => {
    if (recipientMode !== 'vendor' || !selectedVendorId) return;
    const v = vendors.find((x) => String(x.id) === String(selectedVendorId));
    if (v) {
      setWalletAddress(v.walletAddress);
      setNetwork(v.network);
    }
  }, [recipientMode, selectedVendorId, vendors]);

  if (!isOpen) return null;

  const handleProceed = () => {
    onProceed?.({ address: walletAddress.trim(), amountCrypto, amountDollar, network });
    onClose();
  };

  const verb = variant === 'disburse' ? 'Disburse' : 'Send';
  const title = recipientName ? `${verb} ${displayTicker} (${recipientName})` : `${verb} ${displayTicker}`;

  const canPickVendor = vendorsForSelect.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Close">
            &times;
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">Recipient</span>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-800">
                <input
                  type="radio"
                  name="send-recipient"
                  className="text-[#147341] focus:ring-[#147341]"
                  checked={recipientMode === 'vendor'}
                  disabled={!canPickVendor}
                  onChange={() => {
                    setRecipientMode('vendor');
                    setSelectedVendorId('');
                    setWalletAddress('');
                  }}
                />
                Vendor
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-800">
                <input
                  type="radio"
                  name="send-recipient"
                  className="text-[#147341] focus:ring-[#147341]"
                  checked={recipientMode === 'manual'}
                  onChange={() => {
                    setRecipientMode('manual');
                    setSelectedVendorId('');
                    setWalletAddress('');
                  }}
                />
                Manual address
              </label>
            </div>
            {!canPickVendor && (
              <p className="text-xs text-gray-500 mt-1">
                {variant === 'disburse'
                  ? 'No vendors configured. Use manual address.'
                  : `No vendors for ${displayTicker}. Use manual address.`}
              </p>
            )}
          </div>

          {recipientMode === 'vendor' && canPickVendor && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#147341]"
              >
                <option value="">Select vendor…</option>
                {vendorsForSelect.map((v) => (
                  <option key={String(v.id)} value={String(v.id)}>
                    {variant === 'disburse' ? `${v.name} — ${v.currency} (${v.network})` : `${v.name} (${v.network})`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {recipientMode === 'vendor' ? 'Wallet address (from vendor)' : 'Wallet address'}
            </label>
            <div className="bg-[#147341] text-white rounded-lg p-3">
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full bg-transparent text-white placeholder-green-200 outline-none text-sm"
                placeholder="0x... or bc1..."
              />
            </div>
            {recipientMode === 'vendor' && !selectedVendorId && (
              <p className="text-xs text-amber-700 mt-1">Choose a vendor to load their payout address.</p>
            )}
            {recipientMode === 'manual' && (
              <p className="text-xs text-gray-500 mt-1">Enter any valid address for this asset.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount in crypto</label>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <input
                type="text"
                value={amountCrypto}
                onChange={(e) => setAmountCrypto(e.target.value)}
                className="flex-1 px-3 py-2 outline-none"
              />
              <span className="px-3 py-2 bg-gray-100 text-gray-600 font-medium">{displayTicker}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount in dollar</label>
            <input
              type="text"
              value={amountDollar}
              onChange={(e) => setAmountDollar(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#147341]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#147341]"
            >
              {VENDOR_NETWORKS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-500">Transaction fee : $0.5</p>
          <button
            type="button"
            onClick={handleProceed}
            className="w-full py-3 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e]"
          >
            {variant === 'disburse' ? 'Disburse' : 'Proceed'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendCryptoModal;
