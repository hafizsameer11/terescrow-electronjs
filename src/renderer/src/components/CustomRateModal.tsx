import React, { useState } from 'react';
import { AiOutlineClose } from "react-icons/ai"; // Importing close icon from react-icons

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
                    {/* Title */}
                    <div className='w-full flex items-center justify-center'>
                        <h2 className="text-lg font-bold text-gray-700 m-0">Send Rate</h2>
                    </div>
                    {/* Close Button */}
                    <div>
                        <button
                            className="text-gray-700 hover:text-gray-900 focus:outline-none "
                            onClick={onClose}
                        >
                            <AiOutlineClose className="w-6 h-6" /> {/* React Icon for Close */}
                        </button>
                    </div>
                </div>

                {/* Rate Input */}
                <div className="space-y-4">
                    <div className="flex items-center border border-gray-300 rounded-lg  px-4 py-2">
                        {/* Input Field for Rate */}
                        <input
                            type="text"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            className="flex-1 text-gray-700 focus:outline-none focus:ring-0"
                            placeholder="NGN1,700"
                        />

                        {/* Static Dollar Value */}
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
                <div className='flex items-center justify-center'>
                    <button
                        onClick={handleSend}
                        className="w-full px-4 py-4 text-white bg-green-700 rounded-lg hover:bg-green-800 mt-4 text-[18px]"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomRateModal;
