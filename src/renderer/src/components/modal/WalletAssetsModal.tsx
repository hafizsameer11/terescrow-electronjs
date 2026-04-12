import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { MasterWalletAssetAvatar } from '@renderer/components/MasterWalletAssetAvatar';

export interface WalletAssetItem {
  symbol: string;
  name: string;
  balance: string;
  usdValue: string;
  address?: string;
  /** Resolved absolute URL for coin icon (optional). */
  iconUrl?: string;
}

const MOCK_ASSETS: WalletAssetItem[] = [
  { symbol: 'BTC', name: 'Bitcoin Wallet', balance: '10 BTC', usdValue: '$10,000,000', address: '0xbtc1example' },
  { symbol: 'USDT', name: 'Tether Wallet', balance: '10 USDT', usdValue: '$10,000,000', address: '0xusdt1example' },
  { symbol: 'ETH', name: 'Ethereum Wallet', balance: '10 ETH', usdValue: '$10,000,000', address: '0x238fenwejcsniw9dicisndwincsnk' },
  { symbol: 'SOL', name: 'Solana Wallet', balance: '10 SOL', usdValue: '$10,000,000', address: 'sol1example' },
];

interface WalletAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets?: WalletAssetItem[];
  selectedWalletLabel?: string;
  onDisburse?: (symbol: string) => void;
  onDepositAddress?: (asset: WalletAssetItem) => void;
  onCopyAddress?: (address: string) => void;
}

const WalletAssetsModal: React.FC<WalletAssetsModalProps> = ({
  isOpen,
  onClose,
  assets = MOCK_ASSETS,
  selectedWalletLabel,
  onDisburse,
  onDepositAddress,
  onCopyAddress,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = assets.filter(
    (a) =>
      !search ||
      a.symbol.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Wallet Assets{selectedWalletLabel ? ` (${selectedWalletLabel})` : ''}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none" aria-label="Close">
            &times;
          </button>
        </div>
        <div className="p-4 border-b">
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
            <FiSearch className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none text-sm text-gray-700 w-full bg-transparent"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {filtered.map((asset) => (
            <div
              key={asset.symbol}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <MasterWalletAssetAvatar symbol={asset.symbol} iconUrl={asset.iconUrl} className="w-10 h-10 text-lg" />
                  <div>
                    <p className="font-semibold text-gray-800">{asset.symbol}</p>
                    <p className="text-sm text-gray-500">{asset.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{asset.balance}</p>
                  <p className="text-sm text-gray-500">{asset.usdValue}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onDepositAddress?.(asset)}
                  className="flex-1 min-w-[120px] py-2 px-3 border-2 border-[#147341] text-[#147341] text-sm font-medium rounded-lg hover:bg-[#147341] hover:text-white"
                >
                  Deposit address
                </button>
                <button
                  type="button"
                  onClick={() => onDisburse?.(asset.symbol)}
                  className="flex-1 min-w-[120px] py-2 px-3 bg-[#147341] text-white text-sm font-medium rounded-lg hover:bg-[#0d5a2e]"
                >
                  Disburse
                </button>
                <button
                  type="button"
                  onClick={() => onCopyAddress?.(asset.address ?? '')}
                  className="py-2 px-3 border-2 border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Copy address
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletAssetsModal;
