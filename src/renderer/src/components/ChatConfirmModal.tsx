import React from 'react';

interface ChatConfirmModalProps {
  onClose: () => void; // Close the modal
  onConfirm: () => void; // Confirm action
}

const ChatConfirmModal: React.FC<ChatConfirmModalProps> = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-md p-6 relative shadow-lg">
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
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-green-100 text-green-700 p-4 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6.75h-5.25M12.75 6.75h5.25M12.75 11.25h5.25M6 11.25h4.5m0 3h5.25M6 14.25h2.25"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Complete transaction?</h2>
          <p className="text-sm text-gray-600 text-center">
            Are you sure you want to confirm this gift card transaction?
          </p>
          <button
            onClick={onConfirm}
            className="w-full py-2 text-white bg-green-700 rounded-lg hover:bg-green-800 focus:outline-none"
          >
            Yes, confirm
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatConfirmModal;
