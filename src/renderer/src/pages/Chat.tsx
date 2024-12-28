// import StatsCard from '@renderer/components/Dashboard/StatsCard';
// import TransactionsFilter from '@renderer/components/Dashboard/TransactionsFilter';
// import TransactionsTable from '@renderer/components/Dashboard/TransactionsTable';
import { getAllAgentToCusomterChats, getChatStats } from '@renderer/api/queries/admin.chat.queries'
import ChatFilters from '@renderer/components/ChatFilters'
import ChatTable from '@renderer/components/ChatTable'
import StatsCard from '@renderer/components/StatsCard'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { token } from '@renderer/api/config'
import chatData from '@renderer/utils'
const sampleData = [
  {
    id: 1,
    name: 'Qamardeen Abdulmalik',
    username: 'Alucard',
    status: 'Declined',
    serviceType: 'Gift Card',
    transactionType: 'Buy - Amazon gift card',
    date: 'Nov 6, 2024',
    amount: '$100'
  },
  {
    id: 2,
    name: 'Adam Sandler',
    username: 'Adam',
    status: 'Successful',
    serviceType: 'Crypto',
    transactionType: 'Sell - BTC',
    date: 'Nov 6, 2024',
    amount: '$100'
  },
  {
    id: 3,
    name: 'Sasha Sloan',
    username: 'Sasha',
    status: 'Successful',
    serviceType: 'Crypto',
    transactionType: 'Buy - USDT',
    date: 'Nov 6, 2024',
    amount: '$100'
  }
]

const Chat = () => {
  const [filters, setFilters] = useState({
    status: 'All',
    type: 'All',
    dateRange: 'Last 30 days',
    search: '',
    transactionType: 'All',
    category: 'All'
  })

  const { data: chatStatsData } = useQuery({
    queryKey: ['chatStats'],
    queryFn: () => getChatStats({ token }),
    enabled: !!token,
  });
  const { data: chatsData, isLoading: chatLoading, isError: chatIsError, error: chatError } = useQuery({
    queryKey: ['chats'],
    queryFn: () => getAllAgentToCusomterChats({ token }),
    enabled: !!token,
  });
  useEffect(() => {
    console.log('chatsData', chatsData)

  }, [chatsData])

  // Define a helper function to calculate the date range
  const calculateDateRange = (dateRange: string) => {
    const currentDate = new Date();
    switch (dateRange) {
      case 'Last 7 days':
        return new Date(currentDate.setDate(currentDate.getDate() - 7));
      case 'Last 15 days':
        return new Date(currentDate.setDate(currentDate.getDate() - 15));
      case 'Last 30 days':
        return new Date(currentDate.setDate(currentDate.getDate() - 30));
      default:
        return null; // No date filter
    }
  };

  const filteredData = chatsData?.data.filter((item) => {
    const matchesStatus = filters.status === 'All' || item.chatStatus === filters.status;
    const matchesType = filters.type === 'All' || item.department.Type === filters.type;
    const matchesSearch =
      filters.search === '' ||
      item.customer.username.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.agent.username.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory =
      filters.category === 'All' || item.department.niche?.toLowerCase() === filters.category.toLowerCase();

    // Filter by date range
    const selectedDateRange = calculateDateRange(filters.dateRange);
    const matchesDateRange =
      !selectedDateRange || new Date(item.createdAt) >= selectedDateRange;

    return matchesStatus && matchesCategory && matchesType && matchesSearch && matchesDateRange;
  });


  const [activeChat, setActiveChat] = useState<'giftCard' | 'crypto'>('giftCard')
  return (
    <>
      <div className="p-6 space-y-8 w-full">
        <div className="flex items-center justify-between">
          {/* Header */}
          <div className="flex gap-9">
            <h1 className="text-[40px] text-gray-800 font-semibold">Chats</h1>

            {/* Toggle Buttons */}

          </div>
    
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Chat" value={chatStatsData?.data?.totalChats} />
          <StatsCard title="Successful Transaction" value={chatStatsData?.data?.successfulllTransactions} />
          <StatsCard title="Pending Chat" value={chatStatsData?.data?.pendingChats} />
          <StatsCard title="Declined Chat" value={chatStatsData?.data?.declinedChats} />
        </div>

        {/* Transactions Table */}
        <div>
          <ChatFilters
            filters={filters}
            title="Chat History"
            subtitle="Manage total chat and transaction"
            onChange={(updatedFilters) => setFilters({ ...filters, ...updatedFilters })}
          />
          {
            !chatLoading && !chatIsError && !chatError &&
            <ChatTable data={filteredData} isChat={true} onUserViewed={() => null} />
          }
        </div>
      </div>
    </>
  )
}

export default Chat
