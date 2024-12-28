import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCustomerDetails, getCustomerTransactions } from '@renderer/api/queries/adminqueries';
import StatsCard from '@renderer/components/StatsCard';
import TransactionsFilter from '@renderer/components/TransactionsFilter';
import TransactionsTable from '@renderer/components/Transaction/TransactionTable';
import { useAuth } from '@renderer/context/authContext';

const TransactionDetails: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'details' | 'transactions'>('transactions');

  const [filters, setFilters] = useState({
    status: 'All',
    type: 'All',
    dateRange: 'Last 30 days',
    search: '',
  });
  const {token}=useAuth();
  // Fetch transactions using React Query
  const { data: customerTransactions, isLoading, isError, error } = useQuery({
    queryKey: ["customerDetails", customerId],
    queryFn: () => getCustomerTransactions({ token, id: customerId! }),
    enabled: !!customerId,
  });

  // Filter transactions based on filters
  const filteredData = Array.isArray(customerTransactions?.data)
  ? customerTransactions?.data.filter((transaction) => {
      const matchesStatus =
        filters.status === 'All' || transaction.status === filters.status;

      const matchesType =
        filters.type === 'All' || transaction.department?.title === filters.type;

      const matchesSearch =
        filters.search === '' ||
        transaction.category?.title
          ?.toLowerCase()
          .includes(filters.search.toLowerCase());

      return matchesStatus && matchesType && matchesSearch;
    })
  : [];


  const handleTabChange = (tab: 'details' | 'transactions') => {
    setActiveTab(tab);
    if (tab === 'details') {
      navigate(`/customers/${customerId}`);
    } else {
      navigate(`/transaction-details/${customerId}`);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-6">
        <button
          onClick={() => handleTabChange('details')}
          className={`px-4 py-2 rounded-md shadow-sm ${activeTab === 'details'
              ? 'bg-[#147341] text-white'
              : 'text-gray-700 border border-gray-200'
            }`}
        >
          Customer details and activities
        </button>
        <button
          onClick={() => handleTabChange('transactions')}
          className={`ml-4 px-4 py-2 rounded-md shadow-sm ${activeTab === 'transactions'
              ? 'bg-[#147341] text-white'
              : 'text-gray-700 border border-gray-200'
            }`}
        >
          Transaction activities and balance
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-600">Loading transactions...</p>
      ) : isError ? (
        <p className="text-red-600">Failed to load transactions</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
            <StatsCard
              title="Total Transactions"
              value={`${filteredData?.length || 0}`}
              change="+5%"
              isPositive={true}
            />
            <StatsCard
              title="Pending Transactions"
              value={`${filteredData?.filter((txn) => txn.status === 'pending').length || 0
                }`}
              change="+2%"
              isPositive={false}
            />
            <StatsCard
              title="Completed Transactions"
              value={`${filteredData?.filter((txn) => txn.status === 'completed').length || 0
                }`}
              change="+10%"
              isPositive={true}
            />
          </div>

          <div className="mt-10">
            <TransactionsFilter
              title={`Transaction History (${filteredData?.length || 0})`}
              subTitle="View the total transaction history for this user"
              filters={filters}
              onChange={(updatedFilters) => setFilters({ ...filters, ...updatedFilters })}
            />
            <TransactionsTable
              data={filteredData || []}
              showCustomerDetailsButton={false}
              showTransactionDetailsModal={true}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionDetails;
