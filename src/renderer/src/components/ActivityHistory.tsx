import React, { useState } from 'react'
import ActivityTable from './ActivityTable'
import TeamFilterActivityTabs from './TeamFilterActivityTabs'
import ChatTable from './ChatTable'

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

const ActivityHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Activity History')
  const [activeFilter, setActiveFilter] = useState('Customer')

  return (
    <div className="space-y-8">
      <TeamFilterActivityTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeFilter={activeFilter} // Pass the active filter
        onFilterChange={setActiveFilter} // Pass the filter change handler
      />

      {activeTab === 'Activity History' ? (
        <ActivityTable data={dummyData} />
      ) : (
        <ChatTable data={sampleData} isChat={true} onUserViewed={() => null} activeFilterInTeam={activeFilter} />
      )}
    </div>
  )
}

export default ActivityHistory
