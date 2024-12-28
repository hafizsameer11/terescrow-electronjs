// import StatsCard from '@renderer/components/Dashboard/StatsCard';
// import TransactionsFilter from '@renderer/components/Dashboard/TransactionsFilter';
import { token } from '@renderer/api/config'
import { getTransactions } from '@renderer/api/queries/adminqueries'
import StatsCard from '@renderer/components/StatsCard'
import TransactionsTable from '@renderer/components/Transaction/TransactionTable'
import TransactionsFilter from '@renderer/components/TransactionsFilter'
import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'

const Dashboard: React.FC = () => {
  const {
    data: customerTransactions,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['customerDetails'],
    queryFn: () => getTransactions({ token }),
    enabled: !!token
  })
  const [filters, setFilters] = useState({
    status: 'All',
    type: 'All',
    dateRange: 'Last 30 days',
    search: '',
    transactionType: 'All',
    category: 'All'
  })
  const filteredData = Array.isArray(customerTransactions?.data)
    ? customerTransactions?.data.filter((transaction) => {
        const matchesStatus = filters.status === 'All' || transaction.status === filters.status

        const matchesType = filters.type === 'All' || transaction.department?.Type === filters.type

        const matchesSearch =
          filters.search === '' ||
          transaction.category?.title?.toLowerCase().includes(filters.search.toLowerCase())

        return matchesStatus && matchesType && matchesSearch
      })
    : []
  return (
    <div className="p-6 space-y-8 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-[40px] text-gray-800">Dashboard</h1>

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
      <div className="pb-5 ">
        <TransactionsFilter
          filters={filters}
          onChange={(updatedFilters) => setFilters({ ...filters, ...updatedFilters })}
        />
        <TransactionsTable
          data={filteredData}
          showCustomerDetailsButton={true}
          showTransactionDetailsModal={false}
        />
      </div>
    </div>
  )
}

export default Dashboard
