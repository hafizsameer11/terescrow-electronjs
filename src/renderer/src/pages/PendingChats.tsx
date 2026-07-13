// import StatsCard from '@renderer/components/Dashboard/StatsCard';
// import TransactionsFilter from '@renderer/components/Dashboard/TransactionsFilter';
// import TransactionsTable from '@renderer/components/Dashboard/TransactionsTable';
import { getAllAgentToCusomterChats, getChatStats } from '@renderer/api/queries/admin.chat.queries'
// import ChatFilters from '@renderer/components/ChatFilters'
// import ChatTable from '@renderer/components/ChatTable'
// import StatsCard from '@renderer/components/StatsCard'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { apiDateParams, matchesDateRange } from '@renderer/utils/dateRange'
import { useDebouncedValue } from '@renderer/utils/useDebouncedValue'
// import chatData from '@renderer/utils'
import { useAuth } from '@renderer/context/authContext'
import PendingChatsTable from '@renderer/components/PendingChatsTable'
import { getAllDefaultChats } from '@renderer/api/queries/agent.queries'


const PendingChats = () => {
  const [filters, setFilters] = useState({
    status: 'All',
    type: 'All',
    dateRange: 'All',
    search: '',
    transactionType: 'All',
    category: 'All'
  })
  const {token}=useAuth();
  const { data: chatsData, isLoading: chatLoading, isError: chatIsError, error: chatError } = useQuery({
    queryKey: ['pendingChats'],
    queryFn: () => getAllDefaultChats(token),
    enabled: !!token,
    // refetchInterval: 3000
  });
  useEffect(() => {
    console.log('chatsData', chatsData)

  }, [chatsData])
  const [dateRangePresetActive, setDateRangePresetActive] = useState(false);
  const debouncedSearch = useDebouncedValue(filters.search.trim(), 400);
  const { startDate, endDate } = useMemo(
    () => apiDateParams({ dateRange: filters.dateRange, dateRangePresetActive }),
    [filters.dateRange, dateRangePresetActive]
  );

  const filteredData = chatsData?.data.filter((item) => {
    const matchesStatus = filters.status === 'All' || item.chatStatus === filters.status;
    const matchesType = filters.type === 'All' || item.department.Type === filters.type;
    const matchesSearch =
      debouncedSearch === '' ||
      item.customer.username.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.agent.username.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory =
      filters.category === 'All' || item.department.niche?.toLowerCase() === filters.category.toLowerCase();

    const matchesDate = matchesDateRange(item.createdAt, startDate, endDate);

    return matchesStatus && matchesCategory && matchesType && matchesSearch && matchesDate;
  });


  return (
    <>
      <div className="p-6 space-y-8 w-full">
        <div className="flex items-center justify-between">
          {/* Header */}
          <div className="flex gap-9">
            <h1 className="text-[40px] text-gray-800 font-semibold">Pending Chats</h1>

            {/* Toggle Buttons */}

          </div>

        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Chat" value={chatStatsData?.data?.totalChats} />
          <StatsCard title="Successful Transaction" value={chatStatsData?.data?.successfulllTransactions} />
          <StatsCard title="Pending Chat" value={chatStatsData?.data?.pendingChats} />
          <StatsCard title="Declined Chat" value={chatStatsData?.data?.declinedChats} />
        </div> */}

        {/* Transactions Table */}
        <div>
          {/* <ChatFilters
            filters={filters}
            title="Chat History"
            subtitle="Manage total chat and transaction"
            onChange={(updatedFilters) => {
              if (updatedFilters.dateRange !== undefined) setDateRangePresetActive(true);
              setFilters({ ...filters, ...updatedFilters });
            }}
          /> */}
          {
            !chatLoading && !chatIsError && !chatError &&
            <PendingChatsTable data={chatsData?.data} isChat={true} onUserViewed={() => null} />
          }
        </div>
      </div>
    </>
  )
}

export default PendingChats
