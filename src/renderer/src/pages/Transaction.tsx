import { getTransactionStats } from '@renderer/api/queries/admin.chat.queries'
import { getTransactions } from '@renderer/api/queries/adminqueries'
import StatsCard from '@renderer/components/StatsCard'
// import CustomerTransaction from '@renderer/components/Transaction/CutomerTransaction';
import TransactionsTable from '@renderer/components/Transaction/TransactionTable'
import TransactionsFilter from '@renderer/components/TransactionsFilter'
import { useAuth } from '@renderer/context/authContext'
import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const Transactions: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'details' | 'transactions'>('transactions')
  const { token } = useAuth();
  const customerData = {
    id: customerId || '1',
    name: 'Qamardeen Abdulmalik',
    username: 'Alucard',
    stats: {
      totalTransactions: 'NGN150,000',
      cryptoTransactions: 'NGN150,000',
      giftCardTransactions: 'NGN150,000'
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
          dollarAmount: '$250,000',
          nairaAmount: 'NGN425,000,000',
          serviceType: 'Gift Card Purchase',
          giftCardType: 'Amazon Gift Card',
          giftCardSubType: '-',
          quantity: 2,
          code: '034ahds49djskd',
          transactionId: '238Dsjfjf3djcmdnsd',
          assignedAgent: 'Qamardeen Abdulmalik',
          status: 'Successful'
        }
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
          dollarAmount: '$100,000',
          nairaAmount: 'NGN75,000,000',
          serviceType: 'Crypto',
          giftCardType: '-',
          giftCardSubType: '-',
          quantity: 1,
          code: 'BTC123456',
          transactionId: '238DsBTC123',
          assignedAgent: 'Adam Sandler',
          status: 'Successful'
        }
      }
    ]
  }
  const { data: customerTransactions, isLoading, isError, error } = useQuery({
    queryKey: ["customerDetails"],
    queryFn: () => getTransactions({ token }),
    enabled: !!token,
  });
  const [filters, setFilters] = useState({
    status: 'All',
    type: 'All',
    dateRange: 'Last 30 days',
    search: ''
  })
  const { data: transationStats, isLoading: transactionStatLoading } = useQuery({
    queryKey: ['transactionStats'],
    queryFn: () => getTransactionStats({ token }),
    enabled: !!token,
  });

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<
    (typeof customerData.transactions)[0]['details'] | null
  >(null)

  // Filter data based on the selected filters
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
    setActiveTab(tab)
    if (tab === 'details') {
      navigate(`/customers/${customerId}`)
    } else {
      navigate(`/transaction-details/${customerId}`)
    }
  }

  const handleTransactionClick = (transactionId: number) => {
    const transaction = customerData.transactions.find((txn) => txn.id === transactionId)
    if (transaction) {
      setSelectedTransaction(transaction.details)
      setIsModalOpen(true)
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-4xl font-semibold text-gray-800 mb-5">Transactions</h2>

      {/* Stats Cards */}

      {
        !transactionStatLoading &&
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Total Transactions"
            value={transationStats?.data.totalTransactions}
            change="+5%"
            isPositive={true}
          />
          <StatsCard
            title="Crypto Transactions"
            value={transationStats?.data.cryptoTransactions._sum.amount !==null ? transationStats?.data.cryptoTransactions._sum.amount : 0}
            change="+5%"
            isPositive={true}
          />
          <StatsCard
            title="Gift Card Transactions"
            value={`$${transationStats?.data.giftCardTransactions._sum.amount !== null ? transationStats?.data.giftCardTransactions._sum.amount : 0}`}
            change="+5%"
            isPositive={true}
          />
        </div>
      }
      <div>
        <div className="mt-10">
          <TransactionsFilter
            title="Transactions"
            subTitle="Manage customer transactions"
            filters={filters}
            onChange={(updatedFilters) => setFilters({ ...filters, ...updatedFilters })}
          />
          <TransactionsTable
            data={filteredData}
            showTransactionDetailsModal={false}
            showCustomerDetailsButton
          />
        </div>
      </div>
    </div>
  )
}

export default Transactions
