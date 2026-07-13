import React, { useState } from 'react';
import { FREEZE_FEATURE_UI_OPTIONS } from '@renderer/utils/freezeFeatures';

interface FreezeFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
  onProceed: (feature: string) => void;
  isSubmitting?: boolean;
}

const FreezeFeatureModal: React.FC<FreezeFeatureModalProps> = ({
  isOpen,
  onClose,
  customerId,
  onProceed,
  isSubmitting = false,
}) => {
  const [selectedFeature, setSelectedFeature] = useState<string>(FREEZE_FEATURE_UI_OPTIONS[0]);

  if (!isOpen) return null;

  const handleProceed = () => {
    if (isSubmitting) return;
    onProceed(selectedFeature);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setSelectedFeature(FREEZE_FEATURE_UI_OPTIONS[0]);
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
          {FREEZE_FEATURE_UI_OPTIONS.map((feature) => (
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
            type="button"
            onClick={handleProceed}
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Freezing…' : 'Proceed'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreezeFeatureModal;
