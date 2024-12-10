import React, { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import TransactionDetailsModal from "./modal/TransactionDetailsModal";

interface Transaction {
  id: number;
  name: string;
  type: string;
  amountUSD: string;
  amountNGN: string;
  profit: string;
  paid: string;
  loggedBy: string;
  category: string; // Gift Card or Crypto
  transactionType: string; // Buy or Sell
}

interface Filter {
  category: string; // Gift Card or Crypto
  transactionType: string; // Buy or Sell
  dateRange: string;
  search: string;
}

const transactionsData: Transaction[] = [
  {
    id: 1,
    name: "Razer Gold - United States",
    type: "E-Code",
    amountUSD: "$100",
    amountNGN: "NGN170,000",
    profit: "NGN3,000",
    paid: "NGN167,000",
    loggedBy: "Dave",
    category: "Gift Card",
    transactionType: "Buy",
  },
  {
    id: 2,
    name: "Steam Wallet - Canada",
    type: "E-Code",
    amountUSD: "$50",
    amountNGN: "NGN85,000",
    profit: "NGN2,000",
    paid: "NGN83,000",
    loggedBy: "Alice",
    category: "Gift Card",
    transactionType: "Sell",
  },
  {
    id: 3,
    name: "Bitcoin",
    type: "Crypto",
    amountUSD: "$200",
    amountNGN: "NGN370,000",
    profit: "NGN5,000",
    paid: "NGN365,000",
    loggedBy: "Bob",
    category: "Crypto",
    transactionType: "Buy",
  },
  {
    id: 4,
    name: "Ethereum",
    type: "Crypto",
    amountUSD: "$150",
    amountNGN: "NGN280,000",
    profit: "NGN4,000",
    paid: "NGN276,000",
    loggedBy: "Eve",
    category: "Crypto",
    transactionType: "Sell",
  },
  {
    id: 5,
    name: "Google Play - Germany",
    type: "E-Code",
    amountUSD: "$75",
    amountNGN: "NGN120,000",
    profit: "NGN2,500",
    paid: "NGN117,500",
    loggedBy: "Charlie",
    category: "Gift Card",
    transactionType: "Buy",
  },
];

const LogTable: React.FC = () => {
  const [filters, setFilters] = useState<Filter>({
    category: "Gift Card",
    transactionType: "Buy",
    dateRange: "Last 30 days",
    search: "",
  });

  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };
  const handleFilterChange = (updatedFilters: Partial<Filter>) => {
    setFilters((prev) => ({ ...prev, ...updatedFilters }));
  };

  const filteredData = transactionsData.filter((transaction) => {
    const matchesCategory = transaction.category === filters.category;
    const matchesTransactionType = transaction.transactionType === filters.transactionType;
    const matchesSearch = transaction.name.toLowerCase().includes(filters.search.toLowerCase());
    return matchesCategory && matchesTransactionType && matchesSearch;
  });

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex gap-8 items-center mb-5">
        <h1 className="text-[40px] font-semibold text-gray-800 pb-2">Log Card</h1>
        <div className="flex ">
          <button
            onClick={() => handleFilterChange({ category: "Gift Card", transactionType: "Buy" })}
            className={`px-4 py-2 rounded-md border text-sm font-medium ${filters.category === "Gift Card"
                ? "bg-[#147341] text-white border-[#147341]"
                : "bg- text-[#147341] border-[#147341]"
              }`}
          >
            Gift Card
          </button>
          <button
            onClick={() => handleFilterChange({ category: "Crypto", transactionType: "Buy" })}
            className={`px-4 py-2 rounded-md border text-sm font-medium ${filters.category === "Crypto"
                ? "bg-[#147341] text-white border-[#147341]"
                : "bg- text-gray-600 border-[#147341]"
              }`}
          >
            Crypto
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center mb-6">
        <div className="">
          <button
            onClick={() => handleFilterChange({ transactionType: "Buy" })}
            className={`px-4 py-2 rounded-lg border text-sm font-medium ${filters.transactionType === "Buy"
                ? "bg-[#147341] text-white border-[#147341]"
                : "bg- text-gray-600 border-[#147341]"
              }`}
          >
            {filters.category === "Gift Card" ? "Gift card buy" : "Crypto buy"}
          </button>
          <button
            onClick={() => handleFilterChange({ transactionType: "Sell" })}
            className={`px-4 py-2 rounded-lg border text-sm font-medium ${filters.transactionType === "Sell"
                ? "bg-[#147341] text-white border-[#147341]"
                : "bg- text-gray-600 border-[#147341]"
              }`}
          >
            {filters.category === "Gift Card" ? "Gift card sell" : "Crypto sell"}
          </button>
        </div>
        <div className="flex space-x-4 items-center">
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange({ dateRange: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-green-500"
          >
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last Year</option>
          </select>
          <input
            type="text"
            placeholder="Search customer"
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md ">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Amount ($)</th>
              <th className="py-3 px-4">Amount (NGN)</th>
              <th className="py-3 px-4">Profit</th>
              <th className="py-3 px-4">Paid</th>
              <th className="py-3 px-4">Logged by</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((transaction) => (
              <tr key={transaction.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4">{transaction.name}</td>
                <td className="py-3 px-4">{transaction.type}</td>
                <td className="py-3 px-4">{transaction.amountUSD}</td>
                <td className="py-3 px-4">{transaction.amountNGN}</td>
                <td className="py-3 px-4">{transaction.profit}</td>
                <td className="py-3 px-4">{transaction.paid}</td>
                <td className="py-3 px-4">{transaction.loggedBy}</td>
                <td className="py-3 px-4 text-right relative">
                  <button
                    onClick={() =>
                      setActiveMenu((prev) => (prev === transaction.id ? null : transaction.id))
                    }
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <BsThreeDotsVertical />
                  </button>
                  {activeMenu === transaction.id && (
                    <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-md z-50 w-48 border border-gray-200">
                      <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                        Edit Log
                      </button>
                      <button
                        onClick={() => handleViewDetails(transaction)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        View Transaction details
                      </button>
                      <button className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                        Delete Transaction details
                      </button>
                    </div>

                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>


        {/* Transaction Details Modal */}
        {isModalOpen && selectedTransaction && (
          <TransactionDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            transactionData={{
              dollarAmount: selectedTransaction.amountUSD,
              nairaAmount: selectedTransaction.amountNGN,
              serviceType: selectedTransaction.type,
              giftCardType: selectedTransaction.category === "Gift Card" ? selectedTransaction.name : undefined,
              giftCardSubType: selectedTransaction.category === "Gift Card" ? selectedTransaction.type : undefined,
              quantity: 1,
              code: "12345-ABCDE",
              transactionId: `TX-${selectedTransaction.id}`,
              assignedAgent: selectedTransaction.loggedBy,
              status: "Successful",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LogTable;
