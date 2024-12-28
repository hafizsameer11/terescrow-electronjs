import { getTransactions } from '@renderer/api/queries/adminqueries';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import LogTable from '@renderer/components/LogTable';
import { useAuth } from '@renderer/context/authContext';

const LogPage: React.FC = () => {
  const [filters, setFilters] = useState({
    niche: 'All', // Filter for Crypto or Gift Card
    type: 'All', // Filter for Buy or Sell
    dateRange: 'All', // Filter by date range
    search: '',
  });

  const {token}=useAuth();
  const { data: customerTransactions, isLoading, isError, error } = useQuery({
    queryKey: ['customerTransactions'],
    queryFn: () => getTransactions({ token }),
    enabled: !!token,
  });

  const handleFilterChange = (updatedFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...updatedFilters }));
  };

  // Calculate date ranges
  const calculateDateRange = (range: string): [Date | null, Date | null] => {
    const today = new Date();
    switch (range) {
      case 'Last 30 days':
        return [new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30), today];
      case 'Last 7 days':
        return [new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7), today];
      case 'Last Year':
        return [new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()), today];
      default:
        return [null, null]; // No filtering
    }
  };

  // Filter the data
  const filteredData = Array.isArray(customerTransactions?.data)
    ? customerTransactions.data.filter((transaction) => {
      const matchesNiche =
        filters.niche === 'All' || transaction.department?.niche === filters.niche;

      const matchesType =
        filters.type === 'All' || transaction.department?.Type === filters.type;

      const matchesSearch =
        filters.search === '' ||
        transaction.customer?.username
          ?.toLowerCase()
          .includes(filters.search.toLowerCase());

      const [startDate, endDate] = calculateDateRange(filters.dateRange);
      const transactionDate = new Date(transaction.createdAt);
      const matchesDate =
        !startDate || !endDate || (transactionDate >= startDate && transactionDate <= endDate);

      return matchesNiche && matchesType && matchesSearch && matchesDate;
    })
    : [];

  return (
    <>
      <div className="w-full">
        {/* Title and Category Buttons */}
        <div className="flex gap-8 items-center mb-5">
          <h1 className="text-[40px] font-semibold text-gray-800 pb-2">Log Card</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange({ niche: 'All' })}
              className={`px-4 py-2 rounded-md border text-sm font-medium ${filters.niche === 'All'
                  ? 'bg-[#147341] text-white border-[#147341]'
                  : 'bg-white text-[#147341] border-[#147341]'
                }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange({ niche: 'giftCard' })}
              className={`px-4 py-2 rounded-md border text-sm font-medium ${filters.niche === 'giftCard'
                  ? 'bg-[#147341] text-white border-[#147341]'
                  : 'bg-white text-[#147341] border-[#147341]'
                }`}
            >
              Gift Card
            </button>
            <button
              onClick={() => handleFilterChange({ niche: 'crypto' })}
              className={`px-4 py-2 rounded-md border text-sm font-medium ${filters.niche === 'crypto'
                  ? 'bg-[#147341] text-white border-[#147341]'
                  : 'bg-white text-[#147341] border-[#147341]'
                }`}
            >
              Crypto
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-6">
          {/* Buy/Sell Filter */}
          <div className="space-x-2">
            <button
              onClick={() => handleFilterChange({ type: 'All' })}
              className={`px-4 py-2 rounded-lg border text-sm font-medium ${filters.type === 'All'
                  ? 'bg-[#147341] text-white border-[#147341]'
                  : 'bg-white text-[#147341] border-[#147341]'
                }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange({ type: 'buy' })}
              className={`px-4 py-2 rounded-lg border text-sm font-medium ${filters.type === 'buy'
                  ? 'bg-[#147341] text-white border-[#147341]'
                  : 'bg-white text-[#147341] border-[#147341]'
                }`}
            >
              Buy
            </button>
            <button
              onClick={() => handleFilterChange({ type: 'sell' })}
              className={`px-4 py-2 rounded-lg border text-sm font-medium ${filters.type === 'sell'
                  ? 'bg-[#147341] text-white border-[#147341]'
                  : 'bg-white text-[#147341] border-[#147341]'
                }`}
            >
              Sell
            </button>
          </div>

          {/* Search and Date Range */}
          <div className="flex space-x-4 items-center">
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange({ dateRange: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-green-500"
            >
              <option>All</option>
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
        <LogTable
          data={filteredData}
          showTransactionDetailsModal={true}
          showCustomerDetailsButton={false}
        />
      </div>
    </>
  );
};

export default LogPage;
