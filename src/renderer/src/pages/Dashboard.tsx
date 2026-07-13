import React, { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getDashBoardStats } from '@renderer/api/queries/admin.chat.queries';
import { getAdminTransactions } from '@renderer/api/admin/transactions';
import StatsCard from '@renderer/components/StatsCard';
import TransactionsTable from '@renderer/components/Transaction/TransactionTable';
import TransactionsFilter from '@renderer/components/TransactionsFilter';
import { useAuth } from '@renderer/context/authContext';
import { addThousandSeparator } from '@renderer/api/helper';
import { apiDateParams } from '@renderer/utils/dateRange';
import { useDebouncedValue } from '@renderer/utils/useDebouncedValue';
import ListFetchingIndicator from '@renderer/components/ListFetchingIndicator';

const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/'); // Redirect to the login page
    }
  }, [token, navigate]);

  const [dateRangePresetActive, setDateRangePresetActive] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    type: 'All',
    dateRange: 'All',
    startDate: '',
    endDate: '',
    search: '',
  });

  const { startDate, endDate } = useMemo(
    () => apiDateParams({ ...filters, dateRangePresetActive }),
    [filters.startDate, filters.endDate, filters.dateRange, dateRangePresetActive]
  );
  const debouncedSearch = useDebouncedValue(filters.search.trim(), 400);

  const { data: txData, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['dashboard-transactions', token, filters.status, filters.type, debouncedSearch, startDate, endDate],
    queryFn: () =>
      getAdminTransactions({
        token: token!,
        status: filters.status !== 'All' ? (filters.status.toLowerCase() as 'successful' | 'pending') : undefined,
        type: filters.type !== 'All' ? (filters.type.toLowerCase() as 'buy' | 'sell') : undefined,
        search: debouncedSearch || undefined,
        startDate,
        endDate,
        page: 1,
        limit: 25,
      }),
    enabled: !!token,
    placeholderData: keepPreviousData,
  });

  const initialTxLoad = isLoading && !txData;

  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => getDashBoardStats({ token }),
    enabled: !!token,
  });

  const transactions = txData?.transactions ?? [];

  return (
    <div className="p-6 space-y-8 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-[40px] text-gray-800">Dashboard</h1>

        {/* Custom Date Range Filter */}
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm text-gray-700">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={`${dashboardStats?.data.totalUsers.count || '0'}`}
          isPositive={dashboardStats?.data.totalUsers.change === 'positive'}
          change={`${dashboardStats?.data.totalUsers.percentage ?? '0'}%`}
        />
        <StatsCard
          title="Total Inflow"
          value={`₦${addThousandSeparator(dashboardStats?.data.totalInflow.current) || '0'}`}
          isPositive={dashboardStats?.data.totalInflow.change === 'positive'}
          change={`${dashboardStats?.data.totalInflow.percentage ?? '0'}%`}
        />
        <StatsCard
          title="Total Outflow"
          value={`₦${addThousandSeparator(dashboardStats?.data.totalOutflow.current) || '0'}`}
          isPositive={dashboardStats?.data.totalOutflow.change === 'positive'}
          change={`${dashboardStats?.data.totalOutflow.percentage ?? '0'}%`}
        />
        <StatsCard
          title="Total Revenue"
          value={`₦${addThousandSeparator(dashboardStats?.data.totalRevenue.current) || '0'}`}
          isPositive={dashboardStats?.data.totalRevenue.change === 'positive'}
          change={`${dashboardStats?.data.totalRevenue.percentage ?? '0'}%`}
        />
        <StatsCard
          title="Today's Customers"
          value={`${dashboardStats?.data.todayCustomers?.count ?? dashboardStats?.data.totalUsers?.count ?? '0'}`}
          isPositive={(dashboardStats?.data.todayCustomers?.change ?? dashboardStats?.data.totalUsers.change) === 'positive'}
          change={`${dashboardStats?.data.todayCustomers?.percentage ?? dashboardStats?.data.totalUsers.percentage ?? '0'}%`}
        />
        <StatsCard
          title="Verified Users"
          value={`${dashboardStats?.data.totalVerifiedUsers.count || '0'}`}
          isPositive={dashboardStats?.data.totalVerifiedUsers.change === 'positive'}
          change={`${dashboardStats?.data.totalVerifiedUsers.percentage ?? '0'}%`}
        />
        <StatsCard
          title="Total Transactions"
          value={`${dashboardStats?.data.totalTransactions.count || '0'}`}
          isPositive={dashboardStats?.data.totalTransactions.change === 'positive'}
          change={`${dashboardStats?.data.totalTransactions.percentage ?? '0'}%`}
        />
        <StatsCard
          title="Total Team Members"
          value={`${dashboardStats?.data.totalAgents.count || '0'}`}
          isPositive={dashboardStats?.data.totalAgents.change === 'positive'}
          change={`${dashboardStats?.data.totalAgents.percentage ?? '0'}%`}
        />
      </div>


      {/* Transactions Table */}
      <div className="pb-5">
        <TransactionsFilter
          filters={filters}
          onChange={(updatedFilters) => {
            if (updatedFilters.dateRange !== undefined) setDateRangePresetActive(true);
            setFilters((prev) => ({ ...prev, ...updatedFilters }));
          }}
        />
        <ListFetchingIndicator show={isFetching && !initialTxLoad} />
        {initialTxLoad && <p className="text-gray-600 py-4">Loading transactions…</p>}
        {isError && (
          <p className="text-red-600 py-4">{(error as Error)?.message || 'Failed to load transactions'}</p>
        )}
        {!initialTxLoad && !isError && (
          <TransactionsTable
            data={transactions}
            showCustomerDetailsButton
            showTransactionDetailsModal={false}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
