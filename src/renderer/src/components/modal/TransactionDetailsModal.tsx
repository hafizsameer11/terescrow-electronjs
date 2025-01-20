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
    category?: string;
    giftCardSubType?: string;
    quantity?: number;
    transactionId: string;
    assignedAgent?: string;
    status: string;
    detail?: string[];
    niche?: string
    type?: string
    subCategory?: string;
    fromAddress?: string | undefined | null
    toAddress?: string | undefined | null
    giftCardNumber?: string | null
    profit ?: number
  };
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transactionData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-scroll pt-32 pb-10">
      <div className="bg-white rounded-lg shadow-lg w-[600px] p-6 relative ">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 text-center w-full">
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
            <span className="text-gray-600">Department</span>
            <span className="text-[16px] font-normal text-right">
              {transactionData.serviceType}
            </span>
          </div>

          {transactionData.category && (
            <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
              <span className="text-gray-600">Category</span>
              <span className="text-[16px] font-normal text-right">
                {transactionData.category}
              </span>
            </div>
          )}

          {transactionData.subCategory && (
            <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
              <span className="text-gray-600">Sub Category</span>
              <span className="text-[16px] font-normal text-right">
                {transactionData.subCategory}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
            <span className="text-gray-600">Type</span>
            <span className="text-[16px] font-normal text-right" style={{ textTransform: 'capitalize' }}>
              {transactionData.type}
            </span>
          </div>

          {/* <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
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
          </div> */}
          {
            transactionData?.niche === "giftCard" && (
              <>
                <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
                  <span className="text-gray-600">GIft Card Type</span>
                  <span className="text-[16px] font-normal text-right">
                    {transactionData.giftCardSubType}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
                  <span className="text-gray-600">Gift Card Number</span>
                  <span className="text-[16px] font-normal text-right">
                    {transactionData.giftCardNumber}
                  </span>
                </div>
              </>
            )
          }
          {
            transactionData?.niche === "crypto" && (
              <>
                <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
                  <span className="text-gray-600">To Address</span>
                  <span className="text-[16px] font-normal text-right">
                    {transactionData.toAddress}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
                  <span className="text-gray-600">From Address</span>
                  <span className="text-[16px] font-normal text-right">
                    {transactionData.fromAddress}
                  </span>
                </div>
              </>
            )
          }

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
            <span className="text-gray-600">Profit</span>
            <span className="text-[16px] font-normal text-right">
              {transactionData.profit}
            </span>
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
              className={`px-2 py-1 flex items-center gap-2 text-sm font-medium rounded-lg border ${transactionData.status === "successful"
                ? "bg-green-100 text-green-700 border-green-500"
                : "bg-red-100 text-red-700 border-red-500"
                }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${transactionData.status === "successful" ? "bg-green-700" : "bg-red-700"
                  }`}
              ></span>
              {transactionData.status}
            </span>

          </div>
        </div>

        {/* Footer Icons */}
        {/* <div className="flex gap-5 mt-6 px-6">
          <button className="bg-gray-200 text-gray-700 rounded-full p-3 hover:bg-gray-300">
            <FiUpload className="h-5 w-5" />
          </button>
          <button className="bg-gray-200 text-gray-700 rounded-full p-3 hover:bg-gray-300">
            <FiPrinter className="h-5 w-5" />
          </button>
          <button className="bg-gray-200 text-gray-700 rounded-full p-3 hover:bg-gray-300">
            <FiTrash2 className="h-5 w-5 text-red-500" />
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
