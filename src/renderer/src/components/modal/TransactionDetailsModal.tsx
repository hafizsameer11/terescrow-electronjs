import React from "react";
import { formatNairaAmount } from "@renderer/api/helper";
import { IoCopyOutline } from "react-icons/io5";
import { MdCheckCircle, MdPending, MdError } from "react-icons/md";

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
    niche?: string;
    type?: string;
    subCategory?: string;
    fromAddress?: string | null;
    toAddress?: string | null;
    giftCardNumber?: string | null;
    profit?: number;
    billType?: string;
    billReference?: string;
    billProvider?: string;
    nairaType?: string;
    nairaChannel?: string;
    nairaReference?: string;
    customerName?: string;
  };
}

const niche = (val?: string) => (val ?? '').toLowerCase();

const statusConfig = (status: string) => {
  switch (status) {
    case 'successful':
      return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500', dot: 'bg-green-700', Icon: MdCheckCircle, iconColor: 'text-green-500' };
    case 'pending':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-500', dot: 'bg-yellow-600', Icon: MdPending, iconColor: 'text-yellow-500' };
    default:
      return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500', dot: 'bg-red-700', Icon: MdError, iconColor: 'text-red-500' };
  }
};

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transactionData,
}) => {
  if (!isOpen) return null;

  const n = niche(transactionData.niche);
  const isCrypto = n === 'crypto';
  const isBillPayment = n === 'billpayment';
  const isGiftCard = n === 'giftcard';
  const isNaira = n === 'naira';
  const showAgentProfit = !isCrypto && !isBillPayment;

  const sc = statusConfig(transactionData.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-scroll pt-32 pb-10">
      <div className="bg-white rounded-lg shadow-lg w-[600px] p-6 relative ">
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

        <div className="flex justify-center my-6">
          <sc.Icon className={`${sc.iconColor} text-6xl`} />
        </div>

        <div className="border border-gray-200 rounded-lg">

          {isBillPayment ? (
            <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
              <span className="text-gray-600">Amount</span>
              <span className="text-[16px] font-normal text-right">
                ₦{formatNairaAmount(transactionData.nairaAmount)}
              </span>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
                <span className="text-gray-600">Amount - Dollar</span>
                <span className="text-[16px] font-normal text-right">
                  ${transactionData.dollarAmount}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
                <span className="text-gray-600">Amount - Naira</span>
                <span className="text-[16px] font-normal text-right">
                  ₦{formatNairaAmount(transactionData.nairaAmount)}
                </span>
              </div>
            </>
          )}

          {transactionData.customerName && (
            <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
              <span className="text-gray-600">Customer</span>
              <span className="text-[16px] font-normal text-right">
                {transactionData.customerName}
              </span>
            </div>
          )}

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

          {!isBillPayment && (
            <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
              <span className="text-gray-600">Type</span>
              <span className="text-[16px] font-normal text-right" style={{ textTransform: 'capitalize' }}>
                {transactionData.type}
              </span>
            </div>
          )}

          {isGiftCard && (
            <>
              <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
                <span className="text-gray-600">Gift Card Type</span>
                <span className="text-[16px] font-normal text-right">
                  {transactionData.giftCardSubType || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
                <span className="text-gray-600">Gift Card Number</span>
                <span className="text-[16px] font-normal text-right">
                  {transactionData.giftCardNumber || '-'}
                </span>
              </div>
            </>
          )}

          {isCrypto && (
            <>
              <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
                <span className="text-gray-600">To Address</span>
                <span className="text-[16px] font-normal text-right break-all">
                  {transactionData.toAddress || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
                <span className="text-gray-600">From Address</span>
                <span className="text-[16px] font-normal text-right break-all">
                  {transactionData.fromAddress || '-'}
                </span>
              </div>
            </>
          )}

          {isBillPayment && (
            <>
              <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
                <span className="text-gray-600">Bill Type</span>
                <span className="text-[16px] font-normal text-right">
                  {transactionData.billType || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
                <span className="text-gray-600">Bill Reference</span>
                <span className="text-[16px] font-normal text-right break-all">
                  {transactionData.billReference || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
                <span className="text-gray-600">Provider</span>
                <span className="text-[16px] font-normal text-right" style={{ textTransform: 'capitalize' }}>
                  {transactionData.billProvider || '-'}
                </span>
              </div>
            </>
          )}

          {isNaira && (
            <>
              <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
                <span className="text-gray-600">Type</span>
                <span className="text-[16px] font-normal text-right" style={{ textTransform: 'capitalize' }}>
                  {transactionData.nairaType ?? transactionData.type ?? '-'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
                <span className="text-gray-600">Channel</span>
                <span className="text-[16px] font-normal text-right">
                  {transactionData.nairaChannel || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
                <span className="text-gray-600">Reference</span>
                <span className="text-[16px] font-normal text-right">
                  {transactionData.nairaReference || '-'}
                </span>
              </div>
            </>
          )}

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

          {showAgentProfit && (
            <>
              <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
                <span className="text-gray-600">Profit</span>
                <span className="text-[16px] font-normal text-right">
                  {transactionData.profit}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
                <span className="text-gray-600">Assigned Agent</span>
                <span className="text-[16px] font-normal text-right">
                  {transactionData.assignedAgent || '-'}
                </span>
              </div>
            </>
          )}

          <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
            <span className="text-gray-600">Transaction Status</span>
            <span
              className={`px-2 py-1 flex items-center gap-2 text-sm font-medium rounded-lg border ${sc.bg} ${sc.text} ${sc.border}`}
            >
              <span className={`w-2 h-2 rounded-full ${sc.dot}`}></span>
              {transactionData.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
