import React, { useState } from 'react';

// Placeholder type; replace with API type when ready
interface CryptoAsset {
  symbol: string;
  name: string;
  balance: string;
  usdEquivalent: string;
}

const MOCK_CRYPTO_ASSETS: CryptoAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', balance: '0.0012', usdEquivalent: '25,000 USD' },
  { symbol: 'BNB', name: 'Binance coin', balance: '0.0012', usdEquivalent: '25,000 USD' },
  { symbol: 'SOL', name: 'Solana', balance: '0.0012', usdEquivalent: '25,000 USD' },
];

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  nairaBalance?: string;
  cryptoBalance?: string;
  cryptoAssets?: CryptoAsset[];
}

const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  nairaBalance = 'N200,000',
  cryptoBalance = '$25',
  cryptoAssets = MOCK_CRYPTO_ASSETS,
}) => {
  const [walletTab, setWalletTab] = useState<'naira' | 'crypto'>('naira');
  const [showCryptoAssets, setShowCryptoAssets] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto pt-32 pb-10">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 w-full text-center">Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl absolute top-4 right-4"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-4">
          <button
            type="button"
            onClick={() => setWalletTab('naira')}
            className={`flex-1 py-2.5 text-sm font-medium ${walletTab === 'naira' ? 'bg-[#147341] text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Naira Wallet
          </button>
          <button
            type="button"
            onClick={() => setWalletTab('crypto')}
            className={`flex-1 py-2.5 text-sm font-medium ${walletTab === 'crypto' ? 'bg-[#147341] text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Crypto Wallet
          </button>
        </div>

        {walletTab === 'naira' && (
          <div className="bg-[#147341] text-white rounded-lg p-6 text-center">
            <p className="text-2xl font-bold">{nairaBalance}</p>
          </div>
        )}

        {walletTab === 'crypto' && (
          <>
            <div className="bg-[#147341] text-white rounded-lg p-6 text-center mb-4">
              <p className="text-2xl font-bold">{cryptoBalance}</p>
            </div>
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowCryptoAssets(!showCryptoAssets)}
                className="w-full py-2.5 px-4 bg-[#147341] text-white text-sm font-medium rounded-lg hover:bg-[#0d5a2e]"
              >
                {showCryptoAssets ? 'Hide Assets' : 'View Assets'}
              </button>
            </div>
            {showCryptoAssets && (
              <div className="space-y-3 border border-gray-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-gray-700">Assets</p>
                {cryptoAssets.map((asset) => (
                  <div
                    key={asset.symbol}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{asset.symbol}</span>
                      <span className="text-gray-600 text-sm">({asset.name})</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{asset.balance}</p>
                      <p className="text-xs text-gray-600">{asset.usdEquivalent}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WalletModal;
