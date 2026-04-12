import React, { useState } from 'react';

const FREEZE_FEATURES = [
  'Deposit',
  'Withdrawal',
  'Send crypto',
  'Receive Crypto',
  'Swap Crypto',
  'Buy Crypto',
  'Sell Crypto',
  'Buy Gift Card',
  'Sell Gift Card',
] as const;

interface FreezeFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
  onProceed: (feature: string) => void;
}

const FreezeFeatureModal: React.FC<FreezeFeatureModalProps> = ({
  isOpen,
  onClose,
  customerId,
  onProceed,
}) => {
  const [selectedFeature, setSelectedFeature] = useState<string>(FREEZE_FEATURES[0]);

  if (!isOpen) return null;

  const handleProceed = () => {
    onProceed(selectedFeature);
    setSelectedFeature(FREEZE_FEATURES[0]);
    onClose();
  };

  const handleClose = () => {
    setSelectedFeature(FREEZE_FEATURES[0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto pt-32 pb-10">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Select Feature to freeze</h2>
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-900 text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {FREEZE_FEATURES.map((feature) => (
            <label
              key={feature}
              className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="freezeFeature"
                value={feature}
                checked={selectedFeature === feature}
                onChange={() => setSelectedFeature(feature)}
                className="w-4 h-4 text-[#147341] border-gray-300 focus:ring-[#147341]"
              />
              <span className="text-gray-800">{feature}</span>
            </label>
          ))}
        </div>
        <div className="mt-6">
          <button
            onClick={handleProceed}
            className="w-full py-3 px-4 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e] transition-colors"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreezeFeatureModal;
