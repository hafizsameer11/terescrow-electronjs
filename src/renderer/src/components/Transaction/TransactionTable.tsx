import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionDetailsModal from '../modal/TransactionDetailsModal';
import { Agent, Customer } from '@renderer/api/queries/datainterfaces';
import { useAuth } from '@renderer/context/authContext';
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
  cardNumber?: string | null;
  toAddress: string | null;

  // References
  department: Department;
  category: Category;
  agent?: Customer;
  subCategory: {
    id: number;
    title: string;
  }
  customer?: Customer
  profit: number
  // agent?:Customer
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
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const { userData } = useAuth();

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

  const toggleMenu = (id: number) => {
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
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
          {paginatedData.map((transaction) => (
            <tr
              key={transaction.id}
              className="border-t hover:bg-gray-50 cursor-pointer relative"
              onClick={() => handleRowClick(transaction)}
            >
              <td className="py-3 px-4 font-semibold">{transaction.customer?.username}</td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 flex items-center gap-2 text-sm font-medium rounded-lg border ${transaction.status === 'successful'
                    ? 'bg-green-100 text-green-700 border-green-500'
                    : 'bg-red-100 text-red-700 border-red-500'
                    }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${transaction.status === 'successful' ? 'bg-green-700' : 'bg-red-700'
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
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center p-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg text-sm ${currentPage === 1
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg text-sm ${currentPage === totalPages
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
        >
          Next
        </button>
      </div>

      {showTranModal && isModalOpen && selectedTransaction && (
        <TransactionDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          transactionData={{
            dollarAmount: selectedTransaction.amount.toString(),
            nairaAmount: selectedTransaction.amountNaira.toString(),
            serviceType: selectedTransaction?.department?.title || '',
            category: selectedTransaction?.category?.title || '',
            transactionId: `Teres-${selectedTransaction.id.toString()}`,
            assignedAgent: selectedTransaction.agent?.username || '',
            status: selectedTransaction.status,
            niche: selectedTransaction.department.niche,
            type: selectedTransaction.department.Type,
            toAddress: selectedTransaction.toAddress,
            subCategory: selectedTransaction.subCategory.title,
            fromAddress: selectedTransaction.fromAddress,

            giftCardSubType: selectedTransaction.cardType,
            giftCardNumber: selectedTransaction.cardNumber,
            profit: selectedTransaction.profit
          }}
        />
      )}
    </div>
  );
};

export default TransactionsTable;
