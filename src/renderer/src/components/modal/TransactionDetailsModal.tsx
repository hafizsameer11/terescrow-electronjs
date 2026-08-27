import React from "react";
import { formatNairaAmount } from "@renderer/api/helper";
import { formatNairaType } from "@renderer/utils/formatLabels";
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
    exchangeRate?: number | string | null;
    provider?: string;
    side?: string;
    sourceCurrency?: string;
    targetCurrency?: string;
    sourceAmount?: number | string | null;
    targetAmount?: number | string | null;
    sceneCode?: string;
    giftCardProvider?: string;
    markup?: {
      markupPercent?: number;
      actualAmountNgn?: number;
      userAmountNgn?: number;
      adminMarkupNgn?: number;
    } | null;
    billFeeNgn?: number | null;
    billFeePercent?: number | null;
    billFeeLabel?: string | null;
    providerAmountNgn?: number | null;
  };
}

const niche = (val?: string) => (val ?? '').toLowerCase();

const statusConfig = (status: string) => {
  switch (String(status || '').toLowerCase()) {
    case 'successful':
      return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500', dot: 'bg-green-700', Icon: MdCheckCircle, iconColor: 'text-green-500' };
    case 'pending':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-500', dot: 'bg-yellow-600', Icon: MdPending, iconColor: 'text-yellow-500' };
    default:
      return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500', dot: 'bg-red-700', Icon: MdError, iconColor: 'text-red-500' };
  }
};

function Row({
  label,
  value,
  mono,
  copyable,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  copyable?: string;
}) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4 gap-4">
      <span className="text-gray-600 shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-[16px] font-normal text-right break-all ${mono ? 'font-mono text-sm' : ''}`}>
          {value}
        </span>
        {copyable ? (
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(copyable)}
            className="text-gray-500 hover:text-gray-700 shrink-0"
            title="Copy"
          >
            <IoCopyOutline />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function formatAssetAmount(amount: number | string | null | undefined, currency?: string | null) {
  if (amount === null || amount === undefined || amount === '') return null;
  const n = Number(amount);
  const cur = (currency || '').toUpperCase();
  if (!Number.isFinite(n)) return `${amount}${cur ? ` ${cur}` : ''}`;
  if (cur === 'NGN') return `₦${formatNairaAmount(n)}`;
  if (cur === 'USD') return `$${n}`;
  // crypto units — no fake $ prefix
  const formatted = Math.abs(n) >= 1 ? n.toLocaleString(undefined, { maximumFractionDigits: 8 }) : String(n);
  return cur ? `${formatted} ${cur}` : formatted;
}

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
  const sc = statusConfig(transactionData.status);
  const side = String(transactionData.side || transactionData.type || '').toLowerCase();
  const sourceCur = (transactionData.sourceCurrency || '').toUpperCase();
  const targetCur = (transactionData.targetCurrency || '').toUpperCase();
  const sourceAmt = transactionData.sourceAmount ?? null;
  const targetAmt = transactionData.targetAmount ?? null;

  const fromLabel = formatAssetAmount(sourceAmt, sourceCur);
  const toLabel = formatAssetAmount(targetAmt, targetCur);

  // Primary crypto amount (asset) + NGN leg when present — old receipt style
  let cryptoAssetLabel: string | null = null;
  let cryptoNairaLabel: string | null = null;
  if (isCrypto) {
    if (side === 'buy') {
      cryptoAssetLabel = formatAssetAmount(targetAmt ?? transactionData.dollarAmount, targetCur || transactionData.category);
      cryptoNairaLabel =
        sourceCur === 'NGN'
          ? formatAssetAmount(sourceAmt, 'NGN')
          : transactionData.nairaAmount && Number(transactionData.nairaAmount) > 0
            ? `₦${formatNairaAmount(transactionData.nairaAmount)}`
            : null;
    } else if (side === 'sell') {
      cryptoAssetLabel = formatAssetAmount(sourceAmt ?? transactionData.dollarAmount, sourceCur || transactionData.category);
      cryptoNairaLabel =
        targetCur === 'NGN'
          ? formatAssetAmount(targetAmt, 'NGN')
          : transactionData.nairaAmount && Number(transactionData.nairaAmount) > 0
            ? `₦${formatNairaAmount(transactionData.nairaAmount)}`
            : null;
    } else {
      cryptoAssetLabel = formatAssetAmount(sourceAmt ?? transactionData.dollarAmount, sourceCur || transactionData.category);
      if (targetAmt != null && targetCur) {
        // convert/swap also shows To below
      }
      if (transactionData.nairaAmount && Number(transactionData.nairaAmount) > 0) {
        cryptoNairaLabel = `₦${formatNairaAmount(transactionData.nairaAmount)}`;
      }
    }
  }

  const nairaTypeLabel = formatNairaType(transactionData.nairaType ?? transactionData.type);
  const provider =
    transactionData.provider ||
    transactionData.billProvider ||
    transactionData.giftCardProvider ||
    '';

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
          {isCrypto && (
            <>
              {fromLabel && <Row label="From" value={fromLabel} />}
              {toLabel && <Row label="To" value={toLabel} />}
              {cryptoAssetLabel && <Row label="Amount" value={cryptoAssetLabel} />}
              {cryptoNairaLabel && <Row label="Amount (NGN)" value={cryptoNairaLabel} />}
              <Row label="Type" value={(transactionData.side || transactionData.type || '').toString()} />
              <Row label="Asset" value={transactionData.category || undefined} />
              {transactionData.exchangeRate != null && transactionData.exchangeRate !== '' && (
                <Row label="Exchange Rate" value={String(transactionData.exchangeRate)} />
              )}
              {transactionData.fromAddress && (
                <Row label="Deposit Address" value={transactionData.fromAddress} mono copyable={transactionData.fromAddress} />
              )}
              {transactionData.toAddress && (
                <Row label="To Address" value={transactionData.toAddress} mono copyable={transactionData.toAddress} />
              )}
              {provider && <Row label="Provider" value={provider} />}
              {transactionData.markup && (transactionData.markup.adminMarkupNgn ?? 0) > 0 && (
                <>
                  <Row
                    label="Actual amount (Busha)"
                    value={`₦${formatNairaAmount(transactionData.markup.actualAmountNgn ?? 0)}`}
                  />
                  <Row
                    label="User amount"
                    value={`₦${formatNairaAmount(transactionData.markup.userAmountNgn ?? 0)}`}
                  />
                  <Row
                    label="Admin markup"
                    value={`₦${formatNairaAmount(transactionData.markup.adminMarkupNgn ?? 0)}${
                      transactionData.markup.markupPercent
                        ? ` (${transactionData.markup.markupPercent}%)`
                        : ''
                    }`}
                  />
                </>
              )}
            </>
          )}

          {isBillPayment && (
            <>
              <Row
                label="Provider amount"
                value={`₦${formatNairaAmount(
                  transactionData.providerAmountNgn ?? transactionData.nairaAmount
                )}`}
              />
              {(transactionData.billFeeNgn ?? 0) > 0 && (
                <Row
                  label={
                    transactionData.billFeeLabel === 'profit' ? 'Profit' : 'Merchant fee'
                  }
                  value={`₦${formatNairaAmount(transactionData.billFeeNgn ?? 0)}${
                    transactionData.billFeePercent != null
                      ? ` (${transactionData.billFeePercent}%)`
                      : ''
                  }`}
                />
              )}
              <Row label="Total charged" value={`₦${formatNairaAmount(transactionData.nairaAmount)}`} />
              <Row label="Biller" value={transactionData.category || undefined} />
              <Row label="Plan / Item" value={transactionData.subCategory || undefined} />
              <Row label="Bill Type" value={transactionData.sceneCode || transactionData.billType || undefined} />
              <Row
                label="Reference"
                value={transactionData.billReference || undefined}
                mono
                copyable={transactionData.billReference || undefined}
              />
              {provider && <Row label="Provider" value={provider} />}
            </>
          )}

          {isNaira && (
            <>
              <Row label="Amount" value={`₦${formatNairaAmount(transactionData.nairaAmount)}`} />
              <Row label="Transaction Type" value={nairaTypeLabel} />
              <Row label="Channel" value={transactionData.nairaChannel || undefined} />
              <Row
                label="Reference"
                value={transactionData.nairaReference || undefined}
                mono
                copyable={transactionData.nairaReference || undefined}
              />
              {provider && <Row label="Provider" value={provider} />}
            </>
          )}

          {isGiftCard && (
            <>
              <Row label="Amount (USD)" value={`$${transactionData.dollarAmount}`} />
              {Number(transactionData.nairaAmount) > 0 && (
                <Row label="Amount (NGN)" value={`₦${formatNairaAmount(transactionData.nairaAmount)}`} />
              )}
              <Row label="Product" value={transactionData.category || undefined} />
              <Row label="Card Type" value={transactionData.giftCardSubType || undefined} />
              <Row label="Card Number" value={transactionData.giftCardNumber || undefined} />
              {provider && <Row label="Provider" value={provider} />}
            </>
          )}

          {!isCrypto && !isBillPayment && !isNaira && !isGiftCard && (
            <>
              <Row label="Amount - Dollar" value={`$${transactionData.dollarAmount}`} />
              <Row label="Amount - Naira" value={`₦${formatNairaAmount(transactionData.nairaAmount)}`} />
              <Row label="Department" value={transactionData.serviceType || undefined} />
              <Row label="Category" value={transactionData.category || undefined} />
            </>
          )}

          {transactionData.customerName && (
            <Row label="Customer" value={transactionData.customerName} />
          )}

          {(isCrypto || isBillPayment || isGiftCard || isNaira) && (
            <Row label="Department" value={transactionData.serviceType || undefined} />
          )}

          <Row
            label="Transaction ID"
            value={transactionData.transactionId}
            mono
            copyable={transactionData.transactionId}
          />

          {(isBillPayment) && transactionData.profit != null && Number(transactionData.profit) > 0 && !(transactionData.billFeeNgn) && (
            <Row
              label={transactionData.billFeeLabel === 'profit' ? 'Profit' : 'Merchant fee'}
              value={`₦${formatNairaAmount(transactionData.profit)}`}
            />
          )}

          {!isCrypto && !isBillPayment && transactionData.profit != null && (
            <Row label="Profit" value={transactionData.profit} />
          )}

          {!isCrypto && !isGiftCard && !isNaira && !isBillPayment && (
            <Row label="Assigned Agent" value={transactionData.assignedAgent || '-'} />
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
