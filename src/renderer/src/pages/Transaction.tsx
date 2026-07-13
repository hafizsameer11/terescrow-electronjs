import { addThousandSeparator } from '@renderer/api/helper'
import {
  getAdminTransactions,
  getAdminTransactionStats,
  type TransactionNiche,
} from '@renderer/api/admin/transactions'
import StatsCard from '@renderer/components/StatsCard'
import TransactionsTable from '@renderer/components/Transaction/TransactionTable'
import TransactionsFilter from '@renderer/components/TransactionsFilter'
import { useAuth } from '@renderer/context/authContext'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import React, { useState, useEffect, useMemo } from 'react'
import { apiDateParams } from '@renderer/utils/dateRange'
import { useDebouncedValue } from '@renderer/utils/useDebouncedValue'
import ListFetchingIndicator from '@renderer/components/ListFetchingIndicator'
import type { TransactionTypeTab } from './TransactionDetails'

const TRANSACTION_TYPE_TABS: { id: TransactionTypeTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'giftCards', label: 'Gift Cards' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'billPayments', label: 'Bill Payments' },
  { id: 'naira', label: 'Naira' },
]

function tabToNiche(tab: TransactionTypeTab): TransactionNiche | undefined {
  if (tab === 'giftCards') return 'giftcard'
  if (tab === 'crypto') return 'crypto'
  if (tab === 'billPayments') return 'billpayment'
  if (tab === 'naira') return 'naira'
  return undefined
}

interface TransactionsProps {
  defaultTransactionType?: TransactionTypeTab
}

const Transactions: React.FC<TransactionsProps> = ({ defaultTransactionType = 'all' }) => {
  const { token } = useAuth()
  const [transactionTypeTab, setTransactionTypeTab] = useState<TransactionTypeTab>(defaultTransactionType)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setTransactionTypeTab(defaultTransactionType)
    setPage(1)
  }, [defaultTransactionType])

  const [dateRangePresetActive, setDateRangePresetActive] = useState(false)
  const [filters, setFilters] = useState({
    status: 'All',
    type: 'All',
    dateRange: 'All',
    search: '',
    startDate: '',
    endDate: '',
  })

  const niche = useMemo(() => tabToNiche(transactionTypeTab), [transactionTypeTab])

  const { startDate, endDate } = useMemo(
    () => apiDateParams({ ...filters, dateRangePresetActive }),
    [filters.startDate, filters.endDate, filters.dateRange, dateRangePresetActive]
  )
  const debouncedSearch = useDebouncedValue(filters.search.trim(), 400)

  const { data: txData, isLoading, isFetching } = useQuery({
    queryKey: ['admin-transactions', token, niche, filters.status, filters.type, debouncedSearch, startDate, endDate, page],
    queryFn: () =>
      getAdminTransactions({
        token: token!,
        niche,
        type: filters.type !== 'All' ? (filters.type.toLowerCase() as 'buy' | 'sell') : undefined,
        status: filters.status !== 'All' ? (filters.status.toLowerCase() as any) : undefined,
        search: debouncedSearch || undefined,
        startDate,
        endDate,
        page,
        limit: 20,
      }),
    enabled: !!token,
    placeholderData: keepPreviousData,
  })

  const initialTxLoad = isLoading && !txData

  const transactions = txData?.transactions ?? []
  const totalPages = txData?.totalPages ?? 0
  const total = txData?.total ?? 0

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-transaction-stats', token, niche, startDate, endDate],
    queryFn: () =>
      getAdminTransactionStats(token!, {
        niche,
        startDate,
        endDate,
      }),
    enabled: !!token,
  })

  return (
    <div className="w-full">
      <div className='flex justify-between items-center mb-7'>
        <h2 className="text-4xl font-semibold text-gray-800 mb-5">Transactions</h2>
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

      {!statsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatsCard
            title="Total Transactions"
            value={statsData?.totalTransactions?.count ?? '0'}
            change={`${statsData?.totalTransactions?.percentage ?? 0}%`}
            isPositive={statsData?.totalTransactions?.change === 'positive'}
          />
          <StatsCard
            title="Crypto"
            value={`$${addThousandSeparator(statsData?.cryptoTransactions?._sum?.amount ?? 0)}`}
            change={`${statsData?.cryptoTransactions?.percentage ?? 0}%`}
            isPositive={statsData?.cryptoTransactions?.change === 'positive'}
          />
          <StatsCard
            title="Gift Cards"
            value={`$${addThousandSeparator(statsData?.giftCardTransactions?._sum?.amount ?? 0)}`}
            change={`${statsData?.giftCardTransactions?.percentage ?? 0}%`}
            isPositive={statsData?.giftCardTransactions?.change === 'positive'}
          />
          <StatsCard
            title="Bill Payments"
            value={`N${addThousandSeparator(statsData?.billPaymentTransactions?._sum?.amountNaira ?? 0)}`}
            change={`${statsData?.billPaymentTransactions?.percentage ?? 0}%`}
            isPositive={statsData?.billPaymentTransactions?.change === 'positive'}
          />
          <StatsCard
            title="Naira"
            value={`N${addThousandSeparator(statsData?.nairaTransactions?._sum?.amountNaira ?? 0)}`}
            change={`${statsData?.nairaTransactions?.percentage ?? 0}%`}
            isPositive={statsData?.nairaTransactions?.change === 'positive'}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded-lg mb-6 mt-4">
        {TRANSACTION_TYPE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setTransactionTypeTab(tab.id); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              transactionTypeTab === tab.id ? 'bg-[#147341] text-white' : 'bg-white text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-10">
        <TransactionsFilter
          title={`Transactions (${total})`}
          subTitle="Manage customer transactions"
          filters={filters}
          showTypeFilter={transactionTypeTab !== 'billPayments'}
          onChange={(updatedFilters) => {
            if (updatedFilters.dateRange !== undefined) setDateRangePresetActive(true)
            setFilters((prev) => ({ ...prev, ...updatedFilters }))
            setPage(1)
          }}
        />
        <ListFetchingIndicator show={isFetching && !initialTxLoad} />
        {initialTxLoad ? (
          <div className="p-8 text-center text-gray-500">Loading transactions…</div>
        ) : (
          <TransactionsTable
            data={transactions}
            showTransactionDetailsModal={true}
            showCustomerDetailsButton
          />
        )}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Page {page} of {totalPages} ({total} total)</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Transactions
