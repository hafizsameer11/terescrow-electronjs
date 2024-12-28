import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionDetailsModal from '../modal/TransactionDetailsModal';
import { Agent, Customer } from '@renderer/api/queries/datainterfaces';

export interface Country {
  id: number;
  title?: string;
}

export interface Transaction {
  id: number;
  transactionId: string;
  status: string;
  cardType: string;
  amount: number;
  amountNaira: number;
  createdAt: string;
  updatedAt: string;
  fromAddress: string | null;
  toAddress: string | null;

  // References
  department: Department;
  category: Category;
  agent?: Agent;
  customer?: Customer;
}

export interface Department {
  id: number;
  title?: string;
  description?: string;
  icon?: string;
  noOfAgents?: number;
  createdAt?: string;
  updatedAt?: string;
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
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  data,
  showCustomerDetailsButton = true,
  onRowClick,
  showTransactionDetailsModal = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

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

  const toggleMenu = (id: number) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  return (
    <div className="my-6 bg-white rounded-lg shadow-md">
      <table className="min-w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="py-3 px-4">Name</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Department</th>

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
                  className={`px-2 py-1 flex items-center gap-2 text-sm font-medium rounded-lg border ${
                    transaction.status === 'successful'
                      ? 'bg-green-100 text-green-700 border-green-500'
                      : 'bg-red-100 text-red-700 border-red-500'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      transaction.status === 'Successful' ? 'bg-green-700' : 'bg-red-700'
                    }`}
                  ></span>
                  {transaction.status}
                </span>
              </td>
              <td className="font-semibold py-3 px-4">{transaction.department.title}</td>
              <td className="font-semibold py-3 px-4">{transaction.category.title}</td>
              <td className="font-semibold py-3 px-4">${transaction.amount}/₦{transaction.amountNaira}</td>
              <td className="font-semibold py-3 px-4">
                {new Date(transaction.createdAt).toLocaleDateString()}
              </td>
              {showCustomerDetailsButton && (
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => toggleMenu(transaction.id)}
                    className="text-black w-full hover:text-gray-700 focus:outline-none"
                  >
                    &#x22EE;
                  </button>
                  {activeMenu === transaction.id && (
                    <div
                      className="absolute right-0 mt-2 bg-[#F6F7FF] rounded-md w-48 z-50"
                      style={{
                        boxShadow: '0px 4px 6px #00000040',
                      }}
                    >
                      <button
                        onClick={() => handleViewCustomerDetails(transaction.customer?.id as number)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        View Customer Details
                      </button>
                      <button
                        onClick={() => navigate(`/transaction-details/${transaction.customer?.id}`)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        View Transaction Details
                      </button>
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {showTransactionDetailsModal && isModalOpen && selectedTransaction && (
        <TransactionDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          transactionData={{
            dollarAmount: selectedTransaction.amount.toString(),
            nairaAmount: selectedTransaction.amountNaira.toString(),
            serviceType: selectedTransaction?.department?.title || '',
            category: selectedTransaction?.category?.title || '',
            transactionId: selectedTransaction.transactionId,
            assignedAgent:selectedTransaction.agent?.user?.username || '',
            status: selectedTransaction.status,
          }}
        />
      )}
    </div>
  );
};

export default TransactionsTable;
