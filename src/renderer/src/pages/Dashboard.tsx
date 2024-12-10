// import StatsCard from '@renderer/components/Dashboard/StatsCard';
// import TransactionsFilter from '@renderer/components/Dashboard/TransactionsFilter';
import StatsCard from '@renderer/components/StatsCard';
import TransactionsTable from '@renderer/components/Transaction/TransactionTable';
import TransactionsFilter from '@renderer/components/TransactionsFilter';
// import TransactionsTable from '@renderer/components/Dashboard/DashboardTransactionsTable';
import React, { useState } from 'react';
// import StatsCard from './StatsCard';
// import TransactionsTable from './TransactionsTable';
// import TransactionsFilter from './TransactionsFilter';

const Dashboard: React.FC = () => {
  const sampleData = [
    {
      id: 1,
      name: 'Qamardeen Abdulmalik',
      username: 'Alucard',
      status: 'Declined',
      serviceType: 'Gift Card',
      transactionType: 'Buy - Amazon gift card',
      date: 'Nov 6, 2024',
      amount: '$100',
    },
    {
      id: 2,
      name: 'Adam Sandler',
      username: 'Adam',
      status: 'Successful',
      serviceType: 'Crypto',
      transactionType: 'Sell - BTC',
      date: 'Nov 6, 2024',
      amount: '$100',
    },
    {
      id: 3,
      name: 'Sasha Sloan',
      username: 'Sasha',
      status: 'Successful',
      serviceType: 'Crypto',
      transactionType: 'Buy - USDT',
      date: 'Nov 6, 2024',
      amount: '$100',
    },
  ];

  const [filters, setFilters] = useState({
    status: 'All',
    type: 'All',
    dateRange: 'Last 30 days',
    search: '',
    transactionType: 'All',
    category: 'All'

  });

  // Filter data based on the selected filters
  const filteredData = sampleData.filter((transaction) => {
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
  return (
    <div className="p-6 space-y-8 w-full">

      <div className="flex items-center justify-between">
        {/* Header */}
        <h1 className="text-[40px] text-gray-800">Dashboard</h1>

        {/* Dropdown */}
        <select className="ml-4 px-3 py-2 rounded-lg border border-gray-300 text-gray-800">
          <option>Last 30 days</option>
          <option>Last 15 days</option>
          <option>Last 7 days</option>
        </select>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value="15,000" change="+1%" isPositive={true} />
        <StatsCard title="Total Inflow" value="NGN2,000,000" change="+1%" isPositive={true} />
        <StatsCard title="Total Outflow" value="NGN2,000,000" change="+1%" isPositive={true} />
        <StatsCard title="Total Revenue" value="NGN5,300,000" change="-1%" isPositive={false} />
        <StatsCard title="Active Users" value="500" change="" />
        <StatsCard title="Total Profit" value="NGN555,000" change="" action="Edit" />
        <StatsCard title="Total Transactions" value="2,000" change="" action="View" />
        <StatsCard title="Total Team Members" value="200" change="" action="View" />
      </div>

      {/* Transactions Table */}
      <div>

        <TransactionsFilter
          filters={filters}
          onChange={(updatedFilters) =>
            setFilters({ ...filters, ...updatedFilters })
          }
        />
        <TransactionsTable
          data={filteredData} // Array of transactions
          showCustomerDetailsButton={true} // Dashboard does not show "View Customer Details"
          showTransactionDetailsModal={false} // Show transaction details modal
        />

      </div>
    </div>
  );
};

export default Dashboard;
