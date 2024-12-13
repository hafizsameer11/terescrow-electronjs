import React from 'react'

interface FilterProps {
  activeTab: string
  onTabChange: (tab: string) => void
  activeFilter?: string // For "Customer" or "Team"
  onFilterChange?: (filter: string) => void // Callback for the new filter
}

const TeamFilterActivityTabs: React.FC<FilterProps> = ({
  activeTab,
  onTabChange,
  activeFilter,
  onFilterChange
}) => {
  return (
    <div className="flex flex-wrap items-center space-x-4">
      {/* Main Tabs */}
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-max">
        <button
          className={`px-4 py-2 text-sm ${
            activeTab === 'Activity History' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
          }`}
          onClick={() => onTabChange('Activity History')}
        >
          Activity History
        </button>
        <button
          className={`px-4 py-2 text-sm ${
            activeTab === 'Chat History' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
          }`}
          onClick={() => onTabChange('Chat History')}
        >
          Chat History
        </button>
      </div>

      {/* Additional Filter for Chat History */}
      {activeTab === 'Chat History' && onFilterChange && (
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-max">
          <button
            className={`px-4 py-2 text-sm ${
              activeFilter === 'Customer' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
            }`}
            onClick={() => onFilterChange('Customer')}
          >
            Customer
          </button>
          <button
            className={`px-4 py-2 text-sm ${
              activeFilter === 'Team' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
            }`}
            onClick={() => onFilterChange('Team')}
          >
            Team
          </button>
        </div>
      )}
    </div>
  )
}

export default TeamFilterActivityTabs
