import React, { useState } from 'react';

interface ChatCancelModalProps {
  onClose: () => void; // Close the modal
  onSubmit: (reason: string) => void; // Submit the failure reason
}

const ChatCancelModal: React.FC<ChatCancelModalProps> = ({ onClose, onSubmit }) => {
  const [reason, setReason] = useState<string>('  ');

  const handleSubmit = () => {
    onSubmit(reason); // Pass the reason to the parent component
    onClose(); // Close the modal after submission
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-md p-6 relative shadow-lg">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Content */}
        <div className="flex flex-col items-center space-y-6">
          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-800 text-center">
            Cancel Transaction
          </h2>

          {/* Confirmation Text */}
          <h5 className="text-md font-medium text-gray-600 text-center">
            Are you sure you want to cancel this transaction?
          </h5>

          {/* Action Buttons */}
          <div className="w-full flex flex-row gap-10">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-[45%] py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none "
            >
              Close
            </button>

            {/* Continue Button */}
            <button
              onClick={handleSubmit}
              className="w-[45%] py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>

  );
};

export default ChatCancelModal;
