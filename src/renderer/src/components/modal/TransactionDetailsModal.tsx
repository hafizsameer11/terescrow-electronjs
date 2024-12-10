import React from "react";
import { IoCopyOutline } from "react-icons/io5";
import { MdCheckCircle } from "react-icons/md";

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionData: {
    dollarAmount: string;
    nairaAmount: string;
    serviceType: string;
    giftCardType?: string;
    giftCardSubType?: string;
    quantity: number;
    code: string;
    transactionId: string;
    assignedAgent: string;
    status: string;
  };
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transactionData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[600px] p-6 relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 text-center w-full">
            Full Transaction Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl absolute top-3 right-4"
          >
            &times;
          </button>
        </div>

        {/* Success Icon */}
        <div className="flex justify-center my-6">
          <MdCheckCircle className="text-green-500 text-6xl" />
        </div>

        {/* Modal Body */}
        <div className="border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
            <span className="text-gray-600">Amount - Dollar</span>
            <span className="text-[16px] font-normal text-right">
              {transactionData.dollarAmount}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
            <span className="text-gray-600">Amount - Naira</span>
            <span className="text-[16px] font-normal text-right">
              {transactionData.nairaAmount}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
            <span className="text-gray-600">Service Type</span>
            <span className="text-[16px] font-normal text-right">
              {transactionData.serviceType}
            </span>
          </div>

          {transactionData.giftCardType && (
            <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
              <span className="text-gray-600">Gift Card Type</span>
              <span className="text-[16px] font-normal text-right">
                {transactionData.giftCardType}
              </span>
            </div>
          )}

          {transactionData.giftCardSubType && (
            <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
              <span className="text-gray-600">Gift Card Sub Type</span>
              <span className="text-[16px] font-normal text-right">
                {transactionData.giftCardSubType}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
            <span className="text-gray-600">Quantity</span>
            <span className="text-[16px] font-normal text-right">
              {transactionData.quantity}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
            <span className="text-gray-600">Code</span>
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-normal">{transactionData.code}</span>
              <button
                onClick={() => navigator.clipboard.writeText(transactionData.code)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoCopyOutline />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
            <span className="text-gray-600">Transaction ID</span>
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-normal">{transactionData.transactionId}</span>
              <button
                onClick={() => navigator.clipboard.writeText(transactionData.transactionId)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoCopyOutline />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
            <span className="text-gray-600">Assigned Agent</span>
            <span className="text-[16px] font-normal text-right">
              {transactionData.assignedAgent}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
            <span className="text-gray-600">Transaction Status</span>
            <span
              className={`px-4 py-1 rounded-lg text-sm ${
                transactionData.status === "Successful"
                  ? "bg-green-100 text-[#147341]"
                  : transactionData.status === "Failed"
                  ? "bg-red-100 text-red-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              {transactionData.status}
            </span>
          </div>
        </div>

        {/* Footer Icons */}
        <div className="flex justify-between mt-6 px-6">
          <button className="bg-gray-200 text-gray-700 rounded-full p-3 hover:bg-gray-300">
            <i className="fas fa-upload"></i>
          </button>
          <button className="bg-gray-200 text-gray-700 rounded-full p-3 hover:bg-gray-300">
            <i className="fas fa-print"></i>
          </button>
          <button className="bg-gray-200 text-gray-700 rounded-full p-3 hover:bg-gray-300">
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
