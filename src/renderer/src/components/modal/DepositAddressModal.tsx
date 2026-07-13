import React from 'react';
import { MasterWalletAssetAvatar } from '@renderer/components/MasterWalletAssetAvatar';

export interface DepositAddressAsset {
  symbol: string;
  name: string;
  address: string;
  iconUrl?: string;
  sharedMasterWalletNote?: string;
}

interface DepositAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: DepositAddressAsset | null;
  onCopy?: (address: string) => void;
}

const DepositAddressModal: React.FC<DepositAddressModalProps> = ({ isOpen, onClose, asset, onCopy }) => {
  if (!isOpen || !asset) return null;
  const addr = (asset.address || '').trim();
  const valid = addr && addr !== '—';

  const copy = () => {
    if (!valid || typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(addr);
    onCopy?.(addr);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[60] overflow-y-auto p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Deposit address</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none" aria-label="Close">
            &times;
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <MasterWalletAssetAvatar symbol={asset.symbol} iconUrl={asset.iconUrl} className="w-12 h-12 text-lg" />
            <div>
              <p className="font-semibold text-gray-900">{asset.name || asset.symbol}</p>
              <p className="text-sm text-gray-500">{asset.symbol}</p>
            </div>
          </div>
          {asset.sharedMasterWalletNote && (
            <p className="text-sm text-blue-800 bg-blue-50 border border-blue-100 rounded-lg p-3">
              {asset.sharedMasterWalletNote}
            </p>
          )}
          {valid ? (
            <>
              <p className="text-sm text-gray-600">
                Send only {asset.name || asset.symbol} to this address. Wrong assets or networks may be lost.
              </p>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 break-all font-mono text-sm text-gray-800">{addr}</div>
              <button
                type="button"
                onClick={copy}
                className="w-full py-3 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e]"
              >
                Copy address
              </button>
            </>
          ) : (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
              No deposit address is available for this asset yet. Check the API or try again later.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositAddressModal;
