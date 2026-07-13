import React from 'react';
import { mapApiFeatureToLabel } from '@renderer/utils/freezeFeatures';

interface FrozenFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  frozenFeatures: string[];
  onUnfreeze: (apiFeature: string) => void;
  onFreezeAnother: () => void;
  unfreezingFeature?: string | null;
  isUnfreezing?: boolean;
}

const FrozenFeaturesModal: React.FC<FrozenFeaturesModalProps> = ({
  isOpen,
  onClose,
  frozenFeatures,
  onUnfreeze,
  onFreezeAnother,
  unfreezingFeature,
  isUnfreezing,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto py-10">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Frozen features</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {frozenFeatures.length === 0 ? (
          <p className="text-gray-600 text-sm mb-6">No features are currently frozen for this customer.</p>
        ) : (
          <ul className="space-y-2 max-h-[50vh] overflow-y-auto mb-6">
            {frozenFeatures.map((feature) => (
              <li
                key={feature}
                className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg border border-gray-200 bg-gray-50"
              >
                <span className="text-gray-800 text-sm font-medium">{mapApiFeatureToLabel(feature)}</span>
                <button
                  type="button"
                  disabled={isUnfreezing}
                  onClick={() => onUnfreeze(feature)}
                  className="shrink-0 px-3 py-1.5 text-sm font-medium text-[#147341] border border-[#147341] rounded-lg hover:bg-[#147341] hover:text-white disabled:opacity-50"
                >
                  {unfreezingFeature === feature ? 'Unfreezing…' : 'Unfreeze'}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onFreezeAnother}
            className="w-full py-2.5 px-4 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e]"
          >
            Freeze another feature
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FrozenFeaturesModal;
