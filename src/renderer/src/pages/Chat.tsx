// Chat.tsx
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@renderer/context/authContext';
import {
  getAllAgentToCusomterChats,
  getChatStats,
  PaginatedChatsResponse,
  ChatRow,
} from '@renderer/api/queries/admin.chat.queries';

import ChatFilters from '@renderer/components/ChatFilters';
import ChatTable from '@renderer/components/ChatTable';
import StatsCard from '@renderer/components/StatsCard';

const PAGE_SIZE = 50;

type UIFilters = {
  status: string;
  type: string;
  dateRange: 'Last 7 days' | 'Last 15 days' | 'Last 30 days' | 'All';
  search: string;
  transactionType: string; // kept for compatibility with your filter component
  category: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
};

const computeStartFromPreset = (label: UIFilters['dateRange']): string | undefined => {
  if (label === 'All') return undefined;
  const now = new Date();
  const d = new Date(now);
  if (label === 'Last 7 days') d.setDate(now.getDate() - 7);
  else if (label === 'Last 15 days') d.setDate(now.getDate() - 15);
  else if (label === 'Last 30 days') d.setDate(now.getDate() - 30);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const Chat = () => {
  const { token } = useAuth();

  // UI filters (compatible with your existing ChatFilters)
  const [filters, setFilters] = useState<UIFilters>({
    status: 'All',
    type: 'All',
    dateRange: 'Last 30 days',
    search: '',
    transactionType: 'All',
    category: 'All',
    startDate: '',
    endDate: '',
  });

  // backend pagination state
  const [page, setPage] = useState(1);

  // debounce search so we don’t refetch on every keystroke
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
      setPage(1); // reset page when search changes
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Stats query (unchanged)
  const { data: chatStatsData } = useQuery({
    queryKey: ['chatStats', token],
    queryFn: () => getChatStats({ token }),
    enabled: !!token,
  });

  // Build backend filters object (translate UI → query params)
  const backendFilters = useMemo(() => {
    const out: Record<string, string | undefined> = {};
    if (filters.status !== 'All') out.status = filters.status;
    if (filters.type !== 'All') out.type = filters.type;
    if (filters.category !== 'All') out.category = filters.category;

    const presetStart = computeStartFromPreset(filters.dateRange);
    // explicit date range has priority; otherwise use preset
    const start = filters.startDate || presetStart || undefined;
    const end = filters.endDate || undefined;

    if (start) out.start = start;
    if (end) out.end = end;

    if (filters.search.trim()) out.q = filters.search.trim();
    // NOTE: transactionType ignored server-side unless you add support
    return out;
  }, [filters]);

  // Main list query with backend pagination
  const {
    data: chatsResp,
    isLoading: chatLoading,
    isError: chatIsError,
    error: chatError,
    refetch,
    isFetching,
  } = useQuery<PaginatedChatsResponse>({
    queryKey: ['chats', token, page, backendFilters],
    queryFn: () =>
      getAllAgentToCusomterChats({
        token,
        page,
        limit: PAGE_SIZE,
        filters: backendFilters,
      }),
    enabled: !!token,
    refetchInterval: 15000, // optional; remove if not needed
    keepPreviousData: true, // smooth pager
  });

  const rows: ChatRow[] = chatsResp?.data ?? [];
  const total = chatsResp?.total ?? 0;
  const totalPages = chatsResp?.totalPages ?? 1;

  // Reset to page 1 whenever non-search filters change
  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.type, filters.category, filters.startDate, filters.endDate, filters.dateRange]);

  return (
    <>
      <div className="p-6 space-y-8 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex gap-9">
            <h1 className="text-[40px] text-gray-800 font-semibold">Chats</h1>
          </div>

          {/* Quick date range inputs */}
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Chats"
            value={chatStatsData?.data?.totalChats?.count || '0'}
            change={`${chatStatsData?.data?.totalChats?.percentage || 0}%`}
            isPositive={chatStatsData?.data?.totalChats?.change === 'positive'}
          />
          <StatsCard
            title="Unsuccessful Chats"
            value={chatStatsData?.data?.unsuccessfulChats?.count || '0'}
            change={`${chatStatsData?.data?.unsuccessfulChats?.percentage || 0}%`}
            isPositive={chatStatsData?.data?.unsuccessfulChats?.change === 'positive'}
          />
          <StatsCard
            title="Successful Transactions"
            value={chatStatsData?.data?.successfulTransactions?.count || '0'}
            change={`${chatStatsData?.data?.successfulTransactions?.percentage || 0}%`}
            isPositive={chatStatsData?.data?.successfulTransactions?.change === 'positive'}
          />
          <StatsCard
            title="Pending Chats"
            value={chatStatsData?.data?.pendingChats?.count || '0'}
            change={`${chatStatsData?.data?.pendingChats?.percentage || 0}%`}
            isPositive={chatStatsData?.data?.pendingChats?.change === 'positive'}
          />
          <StatsCard
            title="Declined Chats"
            value={chatStatsData?.data?.declinedChats?.count || '0'}
            change={`${chatStatsData?.data?.declinedChats?.percentage || 0}%`}
            isPositive={chatStatsData?.data?.declinedChats?.change === 'positive'}
          />
        </div>

        {/* Filters (wire search through debounce) */}
        <ChatFilters
          filters={{ ...filters, search: searchInput }}
          title="Chat History"
          subtitle="Manage total chat and transaction"
          onChange={(updated) => {
            // keep debounced search
            if ('search' in updated) setSearchInput(String(updated.search ?? ''));
            setFilters((prev) => ({ ...prev, ...updated }));
          }}
        />

        {/* Table */}
        {!chatLoading && !chatIsError && !chatError && (
          <>
            <ChatTable
              data={rows}
              isChat
              onUserViewed={() => null}
              // If your ChatTable already has its own pagination UI,
              // you can ignore the pager below and just pass rows.
            />

            {/* Simple pager (remove if ChatTable handles it internally) */}
            <div className="flex items-center justify-between mt-3">
              <button
                className="px-3 py-1 border rounded"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {page} / {totalPages} • {total} results {isFetching ? ' • updating…' : ''}
              </span>
              <button
                className="px-3 py-1 border rounded"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </>
        )}

        {chatLoading && <div className="text-sm text-gray-500">Loading chats…</div>}
        {chatIsError && <div className="text-sm text-red-600">Failed to load chats: {String(chatError)}</div>}
      </div>
    </>
  );
};

export default Chat;
