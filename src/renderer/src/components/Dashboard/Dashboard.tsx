import React from 'react';
import StatsCard from './StatsCard';
import TransactionsTable from './TransactionsTable';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-8 w-full">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

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
      <section>
        <h2 className="text-lg font-semibold text-gray-800">Transactions on the app</h2>
        <p className="text-sm text-gray-600">
          Manage total customers and see their activities
        </p>
        <TransactionsTable />
      </section>
    </div>
  );
};

export default Dashboard;
