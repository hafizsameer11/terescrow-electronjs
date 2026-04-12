import React, { useState, useMemo } from 'react';
import { IoSwapVertical } from 'react-icons/io5';
import { sendFlowDisplayTicker } from '@renderer/utils/masterWalletAssets';

interface SwapCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromSymbol: string;
  onProceed?: (data: { payAmount: string; payUsd: string; receiveAmount: string; receiveUsd: string; receivingWallet: string }) => void;
}

const SwapCryptoModal: React.FC<SwapCryptoModalProps> = ({
  isOpen,
  onClose,
  fromSymbol,
  onProceed,
}) => {
  const [payAmount, setPayAmount] = useState('0.00011');
  const [payUsd, setPayUsd] = useState('$200');
  const [receiveAmount, setReceiveAmount] = useState('200');
  const [receiveUsd, setReceiveUsd] = useState('$200');
  const [receiveSymbol, setReceiveSymbol] = useState('USDC');
  const [receivingWallet, setReceivingWallet] = useState('Master Wallet');

  const displayFrom = useMemo(() => sendFlowDisplayTicker(fromSymbol) || fromSymbol, [fromSymbol]);

  if (!isOpen) return null;

  const handleProceed = () => {
    onProceed?.({
      payAmount,
      payUsd,
      receiveAmount,
      receiveUsd,
      receivingWallet,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Swap {displayFrom}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Close">
            &times;
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">You Pay</label>
            <div className="flex items-center gap-3 border border-gray-300 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                  {displayFrom.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{displayFrom}</p>
                  <p className="text-xs text-gray-500">{displayFrom}</p>
                </div>
              </div>
              <div className="flex-1 text-right">
                <p className="text-xs text-gray-500">{payUsd}</p>
                <input
                  type="text"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full text-right font-medium outline-none"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-[#147341] text-white flex items-center justify-center">
              <IoSwapVertical className="text-xl" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">You Receive</label>
            <div className="flex items-center gap-3 border border-gray-300 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                  {receiveSymbol.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{receiveSymbol}</p>
                  <p className="text-xs text-gray-500">{displayFrom}</p>
                </div>
              </div>
              <div className="flex-1 text-right">
                <p className="text-xs text-gray-500">{receiveUsd}</p>
                <input
                  type="text"
                  value={receiveAmount}
                  onChange={(e) => setReceiveAmount(e.target.value)}
                  className="w-full text-right font-medium outline-none"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receiving Wallet</label>
            <select
              value={receivingWallet}
              onChange={(e) => setReceivingWallet(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#147341]"
            >
              <option>Master Wallet</option>
              <option>Yellow Card</option>
              <option>Tatum Wallet</option>
            </select>
          </div>
          <p className="text-sm text-gray-500">Transaction fee : $0.5</p>
          <button
            type="button"
            onClick={handleProceed}
            className="w-full py-3 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e]"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapCryptoModal;
