import React, { useState, useMemo } from 'react';
import { apiDateParams } from '@renderer/utils/dateRange';
import { useDebouncedValue } from '@renderer/utils/useDebouncedValue';
import ListFetchingIndicator from '@renderer/components/ListFetchingIndicator';
import { useNavigate, useParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getAdminTransactionsByCustomer,
  type TransactionNiche,
} from '@renderer/api/admin/transactions';
import StatsCard from '@renderer/components/StatsCard';
import TransactionsFilter from '@renderer/components/TransactionsFilter';
import TransactionsTable from '@renderer/components/Transaction/TransactionTable';
import { useAuth } from '@renderer/context/authContext';

export type TransactionTypeTab = 'all' | 'giftCards' | 'crypto' | 'billPayments' | 'naira';

function tabToNiche(tab: TransactionTypeTab): TransactionNiche | undefined {
  if (tab === 'giftCards') return 'giftcard';
  if (tab === 'crypto') return 'crypto';
  if (tab === 'billPayments') return 'billpayment';
  if (tab === 'naira') return 'naira';
  return undefined;
}

const TRANSACTION_TYPE_TABS: { id: TransactionTypeTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'giftCards', label: 'Gift Cards' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'billPayments', label: 'Bill Payments' },
  { id: 'naira', label: 'Naira' },
];

const TransactionDetails: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'transactions'>('transactions');
  const [transactionTypeTab, setTransactionTypeTab] = useState<TransactionTypeTab>('all');
  const [page, setPage] = useState(1);

  const [dateRangePresetActive, setDateRangePresetActive] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    type: 'All',
    dateRange: 'All',
    search: '',
    startDate: '',
    endDate: '',
  });

  const niche = useMemo(() => tabToNiche(transactionTypeTab), [transactionTypeTab]);

  const { startDate, endDate } = useMemo(
    () => apiDateParams({ ...filters, dateRangePresetActive }),
    [filters.startDate, filters.endDate, filters.dateRange, dateRangePresetActive]
  );
  const debouncedSearch = useDebouncedValue(filters.search.trim(), 400);

  const { data: txData, isLoading, isError, isFetching } = useQuery({
    queryKey: ['admin-transactions-by-customer', token, customerId, niche, filters.status, filters.type, debouncedSearch, startDate, endDate, page],
    queryFn: () =>
      getAdminTransactionsByCustomer(token!, customerId!, {
        niche,
        type: filters.type !== 'All' ? (filters.type.toLowerCase() as 'buy' | 'sell') : undefined,
        status: filters.status !== 'All' ? (filters.status.toLowerCase() as any) : undefined,
        search: debouncedSearch || undefined,
        startDate,
        endDate,
        page,
        limit: 20,
      }),
    enabled: !!token && !!customerId,
    placeholderData: keepPreviousData,
  });

  const initialTxLoad = isLoading && !txData;

  const transactions = txData?.transactions ?? [];
  const total = txData?.total ?? 0;
  const totalPages = txData?.totalPages ?? 0;

  const pendingCount = transactions.filter((t: any) => t.status === 'pending').length;
  const successfulCount = transactions.filter((t: any) => t.status === 'successful').length;

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

      {initialTxLoad ? (
        <p className="text-gray-600">Loading transactions...</p>
      ) : isError ? (
        <p className="text-red-600">Failed to load transactions</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded-lg mb-6">
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
            <StatsCard
              title="Total Transactions"
              value={`${total}`}
              change=""
              isPositive={true}
            />
            <StatsCard
              title="Pending Transactions"
              value={`${pendingCount}`}
              change=""
              isPositive={false}
            />
            <StatsCard
              title="Completed Transactions"
              value={`${successfulCount}`}
              change=""
              isPositive={true}
            />
          </div>

          <div className="mt-10">
            <TransactionsFilter
              title={`Transaction History (${total})`}
              subTitle="View the total transaction history for this user"
              filters={filters}
              onChange={(updatedFilters) => {
                if (updatedFilters.dateRange !== undefined) setDateRangePresetActive(true);
                setFilters((prev) => ({ ...prev, ...updatedFilters }));
                setPage(1);
              }}
            />
            <ListFetchingIndicator show={isFetching && !initialTxLoad} />
            <TransactionsTable
              data={transactions}
              showCustomerDetailsButton={false}
              showTransactionDetailsModal={true}
            />
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
        </>
      )}
    </div>
  );
};

export default TransactionDetails;
