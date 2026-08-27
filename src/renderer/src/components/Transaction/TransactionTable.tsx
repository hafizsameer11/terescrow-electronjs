import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import TransactionDetailsModal from '../modal/TransactionDetailsModal';
import { Agent, Customer } from '@renderer/api/queries/datainterfaces';
import { useAuth } from '@renderer/context/authContext';
import { formatNairaAmount } from '@renderer/api/helper';
import { revokeCryptoTransaction } from '@renderer/api/admin/transactions';
import {
  cryptoTxStatusBadgeClass,
  cryptoTxStatusDotClass,
  formatCryptoTxStatusLabel,
  isRevokedOrFakeCryptoTxStatus,
} from '@renderer/utils/fakeDeposit';
import { toastError, toastSuccess } from '@renderer/utils/toast';
export interface Country {
  id: number;
  title?: string;
}
export interface Transaction {
  id: number | string;
  transactionId: string;
  status: string;
  cardType: string | null;
  amount: number;
  amountNaira: number;
  createdAt: string;
  updatedAt: string;
  fromAddress: string | null;
  cardNumber?: string | null;
  toAddress: string | null;

  department: Department | null;
  category: Category | null;
  agent?: Customer | null;
  subCategory: { id: number; title: string } | null;
  customer?: Customer;
  profit: number;
  giftCardSubType?: string | null;
  giftCardProvider?: string | null;

  billType?: string | null;
  billReference?: string | null;
  billProvider?: string | null;
  nairaType?: string | null;
  nairaChannel?: string | null;
  nairaReference?: string | null;
  provider?: string | null;
  side?: string | null;
  sourceCurrency?: string | null;
  targetCurrency?: string | null;
  sourceAmount?: number | null;
  targetAmount?: number | null;
  sceneCode?: string | null;
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
}
export interface Department {
  id: number;
  title?: string;
  description?: string;
  icon?: string;
  noOfAgents?: number;
  createdAt?: string;
  updatedAt?: string;
  niche: string
  Type: string

}
export interface Category {
  id: number;
  title?: string;
  subTitle?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;

}
interface TransactionsTableProps {
  data: Transaction[];
  showCustomerDetailsButton?: boolean;
  onRowClick?: (transaction: Transaction) => void;
  showTransactionDetailsModal?: boolean;
  showTranModal?: boolean
}
const TransactionsTable: React.FC<TransactionsTableProps> = ({
  data,
  showCustomerDetailsButton = true,
  onRowClick,
  showTransactionDetailsModal = false,
  showTranModal = true
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<number | string | null>(null);
  const { userData, token } = useAuth();
  const queryClient = useQueryClient();

  const revokeMutation = useMutation({
    mutationFn: (transactionId: string) =>
      revokeCryptoTransaction(token!, transactionId, 'Revoked by admin — fraud/scam token'),
    onSuccess: (data) => {
      if (data.alreadyRevoked) {
        toastSuccess('Transaction was already revoked');
      } else {
        toastSuccess('Transaction revoked and balances reversed');
      }
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-transaction-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-transaction-tracking'] });
    },
    onError: (err: Error) => {
      toastError(err.message || 'Failed to revoke transaction');
    },
  });

  // Ref for detecting clicks outside
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleRowClick = (transaction: Transaction) => {
    if (onRowClick) {
      onRowClick(transaction);
    } else if (showTransactionDetailsModal) {
      setSelectedTransaction(transaction);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleViewCustomerDetails = (customerId: number) => {
    navigate(`/customers/${customerId}`);
  };

  const toggleMenu = (id: number | string) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null); // Close the active menu
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleRevokeTransaction = (transaction: Transaction) => {
    setActiveMenu(null);
    const txId = transaction.transactionId;
    if (!txId || !token) return;
    const label = transaction.category?.title ?? 'crypto';
    const ok = window.confirm(
      `Revoke this ${transaction.department?.title ?? 'crypto'} transaction?\n\n` +
        `ID: ${txId}\n` +
        `Asset: ${label}\n\n` +
        'This will reverse credited balances and mark the transaction as Revoked (fraud) so you can explain to the customer it was revoked by the system.'
    );
    if (!ok) return;
    revokeMutation.mutate(txId);
  };

  const isCryptoTx = (transaction: Transaction) =>
    (transaction.department?.niche ?? '').toLowerCase() === 'crypto';

  const isBushaTx = (transaction: Transaction) =>
    String(transaction.provider || '').toLowerCase() === 'busha';

  const canRevokeTx = (transaction: Transaction) =>
    isCryptoTx(transaction) &&
    !isBushaTx(transaction) &&
    transaction.status?.toLowerCase() === 'successful' &&
    userData?.role !== 'agent';

  const providerLabel = (transaction: Transaction) => {
    const p = String(
      transaction.provider ||
        transaction.billProvider ||
        transaction.giftCardProvider ||
        ''
    ).toLowerCase();
    if (!p) return '—';
    if (p === 'busha') return 'Busha';
    if (p === 'strowallet') return 'StroWallet';
    if (p === 'palmpay') return 'PalmPay';
    if (p === 'pagocard') return 'Pagocard';
    if (p === 'reloadly') return 'Reloadly';
    return p;
  };

  const serviceLabel = (transaction: Transaction) => {
    const n = (transaction.department?.niche ?? '').toLowerCase();
    if (n === 'crypto') {
      const pair = transaction.category?.subTitle || transaction.category?.title || '';
      const side = transaction.side ? String(transaction.side) : '';
      return [side, pair].filter(Boolean).join(' · ') || transaction.category?.title || '';
    }
    if (n === 'billpayment') {
      return [transaction.sceneCode || transaction.billType, transaction.category?.subTitle]
        .filter(Boolean)
        .join(' · ') || transaction.category?.title || '';
    }
    if (n === 'giftcard') {
      return transaction.category?.title || 'Gift Card';
    }
    if (n === 'naira') {
      return transaction.nairaType || transaction.category?.title || 'Naira';
    }
    return transaction.category?.title ?? '';
  };

  return (
    <div className="my-6 bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="min-w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="py-3 px-4">Name</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Type</th>
            <th className="py-3 px-4">Provider</th>
            <th className="py-3 px-4">Service</th>
            <th className="py-3 px-4">Amount</th>
            <th className="py-3 px-4">Date</th>
            {showCustomerDetailsButton && <th className="py-3 px-1"></th>}
          </tr>
        </thead>
        <tbody>
          {data.map((transaction) => (
            <tr
              key={transaction.id}
              className="border-t hover:bg-gray-50 cursor-pointer relative"
              onClick={() => handleRowClick(transaction)}
            >
              <td className="py-3 px-4 font-semibold">{transaction.customer?.username}</td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 flex items-center gap-2 text-sm font-medium rounded-lg border ${cryptoTxStatusBadgeClass(transaction.status)}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${cryptoTxStatusDotClass(transaction.status)}`}
                  ></span>
                  {formatCryptoTxStatusLabel(transaction.status)}
                </span>
              </td>
              <td className="font-semibold py-3 px-4">{transaction.department?.title ?? ''}</td>
              <td className="font-semibold py-3 px-4">{providerLabel(transaction)}</td>
              <td className="font-semibold py-3 px-4">{serviceLabel(transaction)}</td>
              <td className="font-semibold py-3 px-4">
                {(() => {
                  const n = (transaction.department?.niche ?? '').toLowerCase();
                  if (n === 'billpayment' || n === 'naira') {
                    return `₦${formatNairaAmount(transaction.amountNaira)}`;
                  }
                  if (n === 'crypto') {
                    const side = String(transaction.side || '').toLowerCase();
                    const src = (transaction.sourceCurrency || '').toUpperCase();
                    const tgt = (transaction.targetCurrency || '').toUpperCase();
                    const srcAmt = transaction.sourceAmount;
                    const tgtAmt = transaction.targetAmount;
                    if (srcAmt != null && tgtAmt != null && src && tgt) {
                      const from =
                        src === 'NGN' ? `₦${formatNairaAmount(srcAmt)}` : `${srcAmt} ${src}`;
                      const to =
                        tgt === 'NGN' ? `₦${formatNairaAmount(tgtAmt)}` : `${tgtAmt} ${tgt}`;
                      return `${from} → ${to}`;
                    }
                    if (side === 'buy' && tgt) {
                      const crypto = `${transaction.amount} ${tgt}`;
                      const ngn =
                        transaction.amountNaira > 0
                          ? ` / ₦${formatNairaAmount(transaction.amountNaira)}`
                          : '';
                      return `${crypto}${ngn}`;
                    }
                    if (src) {
                      const crypto = `${transaction.amount} ${src}`;
                      const ngn =
                        transaction.amountNaira > 0
                          ? ` / ₦${formatNairaAmount(transaction.amountNaira)}`
                          : '';
                      return `${crypto}${ngn}`;
                    }
                    return String(transaction.amount);
                  }
                  return `$${transaction.amount}/₦${formatNairaAmount(transaction.amountNaira)}`;
                })()}
              </td>
              <td className="font-semibold py-3 px-4">
                {new Date(transaction.createdAt).toLocaleDateString()}
              </td>
              {showCustomerDetailsButton && (
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering row click
                      toggleMenu(transaction.id);
                    }}
                    className="text-black w-full hover:text-gray-700 focus:outline-none"
                  >
                    &#x22EE;
                  </button>
                  {activeMenu === transaction.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-2 bg-[#F6F7FF] rounded-md w-48 z-50"
                      style={{
                        boxShadow: '0px 4px 6px #00000040',
                      }}
                    >
                      {
                        userData?.role !== 'agent' &&
                        <button
                          onClick={() => handleViewCustomerDetails(transaction.customer?.id as number)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          View Customer Details
                        </button>
                      }
                      <button
                        onClick={() => handleTransactionDetails(transaction)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        View Transaction Details
                      </button>
                      {canRevokeTx(transaction) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRevokeTransaction(transaction);
                          }}
                          disabled={revokeMutation.isPending}
                          className="block px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left font-medium disabled:opacity-50"
                        >
                          Revoke (fraud)
                        </button>
                      )}
                      {isCryptoTx(transaction) && isRevokedOrFakeCryptoTxStatus(transaction.status) && (
                        <span className="block px-4 py-2 text-xs text-red-600">
                          Revoked by system — no further action
                        </span>
                      )}
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {showTranModal && isModalOpen && selectedTransaction && (
        <TransactionDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          transactionData={{
            dollarAmount: String(selectedTransaction.amount ?? 0),
            nairaAmount: String(selectedTransaction.amountNaira ?? 0),
            serviceType: selectedTransaction?.department?.title || '',
            category: selectedTransaction?.category?.title || '',
            transactionId: selectedTransaction.transactionId || `Teres-${selectedTransaction.id}`,
            assignedAgent: selectedTransaction.agent?.username || '',
            status: selectedTransaction.status,
            niche: selectedTransaction.department?.niche ?? '',
            type: selectedTransaction.department?.Type ?? selectedTransaction.nairaType ?? '',
            toAddress: selectedTransaction.toAddress ?? '',
            subCategory: selectedTransaction.subCategory?.title ?? '',
            fromAddress: selectedTransaction.fromAddress ?? '',
            giftCardSubType: selectedTransaction.giftCardSubType ?? selectedTransaction.cardType ?? '',
            giftCardNumber: selectedTransaction.cardNumber ?? '',
            giftCardProvider: selectedTransaction.giftCardProvider ?? selectedTransaction.provider ?? '',
            profit: selectedTransaction.profit ?? 0,
            billType: selectedTransaction.billType ?? '',
            billReference: selectedTransaction.billReference ?? '',
            billProvider: selectedTransaction.billProvider ?? '',
            nairaType: selectedTransaction.nairaType ?? '',
            nairaChannel: selectedTransaction.nairaChannel ?? '',
            nairaReference: selectedTransaction.nairaReference ?? '',
            provider: selectedTransaction.provider ?? '',
            side: selectedTransaction.side ?? '',
            sourceCurrency: selectedTransaction.sourceCurrency ?? '',
            targetCurrency: selectedTransaction.targetCurrency ?? '',
            sourceAmount: selectedTransaction.sourceAmount ?? null,
            targetAmount: selectedTransaction.targetAmount ?? null,
            sceneCode: selectedTransaction.sceneCode ?? '',
            exchangeRate: (selectedTransaction as { exchangeRate?: number }).exchangeRate ?? null,
            customerName: [selectedTransaction.customer?.firstname, selectedTransaction.customer?.lastname].filter(Boolean).join(' ') || selectedTransaction.customer?.username || '',
            markup: selectedTransaction.markup ?? null,
            billFeeNgn: selectedTransaction.billFeeNgn ?? null,
            billFeePercent: selectedTransaction.billFeePercent ?? null,
            billFeeLabel: selectedTransaction.billFeeLabel ?? null,
            providerAmountNgn: selectedTransaction.providerAmountNgn ?? null,
          }}
        />
      )}
    </div>
  );
};

export default TransactionsTable;
