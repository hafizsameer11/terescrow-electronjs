import React, { useEffect, useState } from 'react'
import ActivityTable from './ActivityTable'
import TeamFilterActivityTabs from './TeamFilterActivityTabs'
import ChatTable from './ChatTable'
import { useQuery } from '@tanstack/react-query'
import { getAccountActivities } from '@renderer/api/queries/adminqueries'
import { getSingleAgentToCusomterChat, getSingleAgentToTeamChats } from '@renderer/api/queries/admin.chat.queries'
import { useAuth } from '@renderer/context/authContext'
const dummyData = [
  {
    id: 1,
    description: 'Sent a message to Adam Wesley',
    date: 'Nov 7, 2024 - 04:30 PM'
  },
  {
    id: 2,
    description: 'Completed a buy crypto trade',
    date: 'Nov 7, 2024 - 04:30 PM'
  },
  {
    id: 3,
    description: 'Completed a buy crypto trade',
    date: 'Nov 7, 2024 - 04:30 PM'
  },
  {
    id: 4,
    description: 'Completed a buy crypto trade',
    date: 'Nov 7, 2024 - 04:30 PM'
  },
  {
    id: 5,
    description: 'Completed a buy crypto trade',
    date: 'Nov 7, 2024 - 04:30 PM'
  },
  {
    id: 6,
    description: 'Completed a buy crypto trade',
    date: 'Nov 7, 2024 - 04:30 PM'
  },
  {
    id: 7,
    description: 'Completed a buy crypto trade',
    date: 'Nov 7, 2024 - 04:30 PM'
  },
  {
    id: 8,
    description: 'Completed a buy crypto trade',
    date: 'Nov 7, 2024 - 04:30 PM'
  },
  {
    id: 9,
    description: 'Completed a buy crypto trade',
    date: 'Nov 7, 2024 - 04:30 PM'
  },
  {
    id: 10,
    description: 'Completed a buy crypto trade',
    date: 'Nov 7, 2024 - 04:30 PM'
  }
]

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
interface ActivityHistoryProps {
  userId: string
}
const ActivityHistory: React.FC<ActivityHistoryProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('Activity History')
  const [activeFilter, setActiveFilter] = useState('Customer')
  const [isChat, setIsChat] = useState(true)
  const [isTeam, setIsTeam] = useState(false)
  const {token}=useAuth();
  const id = userId;
  const {
    data: accountActivityData,
    error: errorAccitivData
  } = useQuery({
    queryKey: ['accountActivityData'],
    queryFn: () => getAccountActivities({ token: token, id: id! }),
  })
  const { data: chatsData, isLoading: chatLoading, error: chatError } = useQuery({
    queryKey: ['chats'],
    queryFn: () => getSingleAgentToCusomterChat({ token, agentId: id! }),
    enabled: !!token,
  });
  const { data: TeamChatsData, isLoading: teamChatLoading, error: teamChaterror } = useQuery({
    queryKey: ['teamChatHistory'],
    queryFn: () => getSingleAgentToTeamChats({ token, agentId: id! }),
    enabled: !!token,
  });
  useEffect(() => {
    if (errorAccitivData) {
      console.error(errorAccitivData)
    }
    // console.log(accountActivityData)
  }, [accountActivityData])
  useEffect(() => {
    if (chatError) {
      console.error(chatError)
    }
    // console.log(chatsData)
  }, [chatsData])
  useEffect(() => {
    if (teamChaterror) {
      // console.error(teamChaterror)
    }
    console.log(TeamChatsData)
  }, [TeamChatsData])

  // console.log("user selected ", id)
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    if (filter === 'Customer') {
      setIsChat(true)
      setIsTeam(false)
    } else if (filter === 'Team') {
      setIsTeam(true)
      setIsChat(false)
    }
  }
  return (
    <div className="space-y-8">
      <TeamFilterActivityTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {activeTab === 'Activity History' ? (
        <ActivityTable data={accountActivityData?.data} />
      ) : (
        !chatLoading
        &&
        <ChatTable data={chatsData?.data} isChat={isChat} onUserViewed={() => null} isTeam={isTeam} activeFilterInTeam={activeFilter} teamData={TeamChatsData?.data} />
      )}
    </div>
  )
}

export default ActivityHistory
