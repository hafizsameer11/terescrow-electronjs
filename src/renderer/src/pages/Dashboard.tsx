import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getDashBoardStats } from '@renderer/api/queries/admin.chat.queries';
import { getTransactions } from '@renderer/api/queries/adminqueries';
import StatsCard from '@renderer/components/StatsCard';
import TransactionsTable from '@renderer/components/Transaction/TransactionTable';
import TransactionsFilter from '@renderer/components/TransactionsFilter';
import { useAuth } from '@renderer/context/authContext';
import { addThousandSeparator } from '@renderer/api/helper';

const Dashboard: React.FC = () => {
  const { token, userData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/'); // Redirect to the login page
    }
  }, [token, navigate]);

  const {
    data: customerTransactions,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['customerDetails'],
    queryFn: () => getTransactions({ token }),
    enabled: !!token,
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => getDashBoardStats({ token }),
    enabled: !!token,
  });

  const [filters, setFilters] = useState({
    status: 'All',
    type: 'All',
    startDate: '',
    endDate: '',
    search: '',
    transactionType: 'All',
    category: 'All',
  });

  const filteredData = Array.isArray(customerTransactions?.data)
    ? customerTransactions?.data.filter((transaction) => {
      const matchesStatus =
        filters.status === 'All' || transaction.status === filters.status;

      const matchesType =
        filters.type === 'All' ||
        transaction.department?.Type === filters.type;

      const matchesSearch =
        filters.search === '' ||
        transaction.category?.title
          ?.toLowerCase()
          .includes(filters.search.toLowerCase());

      const matchesDateRange =
        (!filters.startDate || new Date(transaction.createdAt) >= new Date(filters.startDate)) &&
        (!filters.endDate || new Date(transaction.createdAt) <= new Date(filters.endDate));

      return matchesStatus && matchesType && matchesSearch && matchesDateRange;
    })
    : [];

  useEffect(() => {
    console.log('dashboard Stats', dashboardStats);
  });

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
          title="Total Profit"
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
          title="Active Users"
          value={`${dashboardStats?.data.totalUsers.count || '0'}`}
          isPositive={dashboardStats?.data.totalUsers.change === 'positive'}
          change={`${dashboardStats?.data.totalUsers.percentage ?? '0'}%`}
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
          onChange={(updatedFilters) =>
            setFilters({ ...filters, ...updatedFilters })
          }
        />
        <TransactionsTable
          data={filteredData}
          showCustomerDetailsButton={true}
          showTransactionDetailsModal={false}
        />
      </div>
    </div>
  );
};

export default Dashboard;
