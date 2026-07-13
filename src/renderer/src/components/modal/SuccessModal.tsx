import React from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  title = 'Success',
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 mx-4 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-[#147341]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-4 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e]"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
