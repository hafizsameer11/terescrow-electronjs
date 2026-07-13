import { getTransactions } from '@renderer/api/queries/adminqueries';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import LogTable from '@renderer/components/LogTable';
import { useAuth } from '@renderer/context/authContext';
import { apiDateParams, DATE_RANGE_PRESETS, matchesDateRange } from '@renderer/utils/dateRange';
import { useDebouncedValue } from '@renderer/utils/useDebouncedValue';

const LogPage: React.FC = () => {
  const [filters, setFilters] = useState({
    niche: 'All', // Filter for Crypto or Gift Card
    type: 'All', // Filter for Buy or Sell
    dateRange: 'All', // Filter by date range
    search: '',
  });

  const { token } = useAuth();
  const { data: customerTransactions, isLoading, isError, error } = useQuery({
    queryKey: ['customerTransactions'],
    queryFn: () => getTransactions({ token }),
    enabled: !!token,
  });

  const [dateRangePresetActive, setDateRangePresetActive] = useState(false);
  const debouncedSearch = useDebouncedValue(filters.search.trim(), 400);

  const handleFilterChange = (updatedFilters: Partial<typeof filters>) => {
    if (updatedFilters.dateRange !== undefined) setDateRangePresetActive(true);
    setFilters((prev) => ({ ...prev, ...updatedFilters }));
  };

  const { startDate, endDate } = useMemo(
    () => apiDateParams({ dateRange: filters.dateRange, dateRangePresetActive }),
    [filters.dateRange, dateRangePresetActive]
  );

  // Filter the data
  const filteredData = Array.isArray(customerTransactions?.data)
    ? customerTransactions.data.filter((transaction) => {
      const matchesNiche =
        filters.niche === 'All' || transaction.department?.niche === filters.niche;

      const matchesType =
        filters.type === 'All' || transaction.department?.Type === filters.type;

      const matchesSearch =
        debouncedSearch === '' ||
        transaction.customer?.username
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase());

      const matchesDate = matchesDateRange(transaction.createdAt, startDate, endDate);

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
              {DATE_RANGE_PRESETS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
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
