// import StatsCard from '@renderer/components/Dashboard/StatsCard';
// import TransactionsFilter from '@renderer/components/Dashboard/TransactionsFilter';
import TransactionDetailsModal from '@renderer/components/modal/TransactionDetailsModal';
import StatsCard from '@renderer/components/StatsCard';
// import CustomerTransaction from '@renderer/components/Transaction/CutomerTransaction';
import TransactionsTable from '@renderer/components/Transaction/TransactionTable';
import TransactionsFilter from '@renderer/components/TransactionsFilter';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TransactionDetails: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"details" | "transactions">(
    "transactions"
  );

  const customerData = {
    id: customerId || '1',
    name: 'Qamardeen Abdulmalik',
    username: 'Alucard',
    stats: {
      totalTransactions: 'NGN150,000',
      cryptoTransactions: 'NGN150,000',
      giftCardTransactions: 'NGN150,000',
    },
    transactions: [
      {
        id: 1,
        name: 'Qamardeen Abdulmalik',
        username: 'Alucard',
        status: 'Failed',
        serviceType: 'Gift Card',
        transactionType: 'Buy - Amazon gift card',
        date: 'Nov 6, 2024',
        amount: '$100 / NGN75,000',
        details: {
          dollarAmount: "$250,000",
          nairaAmount: "NGN425,000,000",
          serviceType: "Gift Card Purchase",
          giftCardType: "Amazon Gift Card",
          giftCardSubType: "-",
          quantity: 2,
          code: "034ahds49djskd",
          transactionId: "238Dsjfjf3djcmdnsd",
          assignedAgent: "Qamardeen Abdulmalik",
          status: "Successful",
        },
      },
      {
        id: 2,
        name: 'Qamardeen Abdulmalik',
        username: 'Alucard',
        status: 'Successful',
        serviceType: 'Crypto',
        transactionType: 'Sell - BTC',
        date: 'Nov 6, 2024',
        amount: '$100 / NGN75,000',
        details: {
          dollarAmount: "$100,000",
          nairaAmount: "NGN75,000,000",
          serviceType: "Crypto",
          giftCardType: "-",
          giftCardSubType: "-",
          quantity: 1,
          code: "BTC123456",
          transactionId: "238DsBTC123",
          assignedAgent: "Adam Sandler",
          status: "Successful",
        },
      },
    ],
  };

  const [filters, setFilters] = useState({
    status: 'All',
    type: 'All',
    dateRange: 'Last 30 days',
    search: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    typeof customerData.transactions[0]["details"]
    | null>(null);

  // Filter data based on the selected filters
  const filteredData = customerData.transactions.filter((transaction) => {
    const matchesStatus =
      filters.status === 'All' || transaction.status === filters.status;
    const matchesType =
      filters.type === 'All' || transaction.serviceType === filters.type;
    const matchesSearch =
      filters.search === '' ||
      transaction.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.username.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const handleTabChange = (tab: "details" | "transactions") => {
    setActiveTab(tab);
    if (tab === "details") {
      navigate(`/customers/${customerId}`);
    } else {
      navigate(`/transaction-details/${customerId}`);
    }
  };

  const handleTransactionClick = (transactionId: number) => {
    const transaction = customerData.transactions.find(
      (txn) => txn.id === transactionId
    );
    if (transaction) {
      setSelectedTransaction(transaction.details);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => handleTabChange("details")}
          className={`px-4 py-2 rounded-md shadow-sm ${activeTab === "details"
              ? "bg-[#147341] text-white"
              : "text-gray-700 border border-gray-200"
            }`}
        >
          Customer details and activities
        </button>
        <button
          onClick={() => handleTabChange("transactions")}
          className={`ml-4 px-4 py-2 rounded-md shadow-sm ${activeTab === "transactions"
              ? "bg-[#147341] text-white"
              : "text-gray-700 border border-gray-200"
            }`}
        >
          Transaction activities and balance
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Total Transactions"
          value={customerData.stats.totalTransactions}
          change="+5%"
          isPositive={true}
        />
        <StatsCard
          title="Crypto Transactions"
          value={customerData.stats.cryptoTransactions}
          change="+5%"
          isPositive={true}
        />
        <StatsCard
          title="Gift Card Transactions"
          value={customerData.stats.giftCardTransactions}
          change="+5%"
          isPositive={true}
        />
      </div>

      {/* Transaction History */}
      <div>
        {/* <h2 className="text-lg font-bold text-gray-800">
          Transaction History ({customerData.transactions.length})
        </h2>
        <p className="text-sm text-gray-600">
          View the total transaction history for this user
        </p> */}

        {/* Filters and Table */}
        <div className="mt-10">
          <TransactionsFilter
          title="Transaction History (3)"
          subTitle = "View the total transaction history for this user"
            filters={filters}
            onChange={(updatedFilters) =>
              setFilters({ ...filters, ...updatedFilters })
            }
          />
          <TransactionsTable
            data={filteredData} // Customer-specific transactions
            showCustomerDetailsButton={false} // Allow "View Customer Details"
            showTransactionDetailsModal ={true}
          />

        </div>
      </div>

      {/* Transaction Modal */}
      {/* {selectedTransaction && (
        <TransactionDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transactionData={selectedTransaction}
        />
      )} */}
    </div>
  );
};

export default TransactionDetails;
