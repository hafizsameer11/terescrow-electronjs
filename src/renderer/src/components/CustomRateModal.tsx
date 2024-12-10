import React, { useState } from 'react';

interface CustomRateModalProps {
    onClose: () => void;
    onSendRate: (rate: string, amountDollar: string, amountNaira: string) => void;
}

const CustomRateModal: React.FC<CustomRateModalProps> = ({ onClose, onSendRate }) => {
    const [rate, setRate] = useState('');
    const [amountDollar, setAmountDollar] = useState('');
    const [amountNaira, setAmountNaira] = useState('');

    const handleSend = () => {
        onSendRate(rate, amountDollar, amountNaira);
        onClose(); // Close the modal after sending
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">Send Rate</h2>
                    <button
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
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
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Rate Input */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                        />
                        <span className="text-gray-500">$1</span>
                    </div>
                    <input
                        type="text"
                        value={amountDollar}
                        onChange={(e) => setAmountDollar(e.target.value)}
                        placeholder="Amount - Dollar"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                    />
                    <input
                        type="text"
                        value={amountNaira}
                        onChange={(e) => setAmountNaira(e.target.value)}
                        placeholder="Amount - Naira"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                    />
                </div>

                <button
                    onClick={handleSend}
                    className="w-full px-4 py-2 text-white bg-green-700 rounded-lg hover:bg-green-800 mt-4"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default CustomRateModal;
