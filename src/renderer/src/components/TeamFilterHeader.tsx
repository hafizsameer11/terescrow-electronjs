import React from 'react'

interface TeamFilterHeaderProps {
  activeTab: 'online' | 'offline' | undefined
  selectedRole: 'Manager' | 'Agent' | 'Roles'
  searchValue: string
  onTabChange: (tab: 'online' | 'offline') => void
  onRoleChange: (role: 'Manager' | 'Agent' | 'Roles') => void
  onSearchChange: (value: string) => void
}

const TeamFilterHeader: React.FC<TeamFilterHeaderProps> = ({
  activeTab,
  selectedRole,
  searchValue,
  onTabChange,
  onRoleChange,
  onSearchChange
}) => {
  return (
    <div className="flex justify-between items-center bg-gray-50 py-4">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Tabs */}
        {activeTab !== undefined && (
          <div className="flex border rounded-lg overflow-hidden">
            <button
              className={`px-4 py-2 text-sm ${
                activeTab === 'online' ? 'bg-green-700 text-white' : 'bg-white text-gray-700'
              } focus:outline-none`}
              onClick={() => onTabChange('online')}
            >
              Online
            </button>
            <button
              className={`px-4 py-2 text-sm ${
                activeTab === 'offline' ? 'bg-green-700 text-white' : 'bg-white text-gray-700'
              } focus:outline-none`}
              onClick={() => onTabChange('offline')}
            >
              Offline
            </button>
          </div>
        )}

        {/* Roles Dropdown */}
        {/* <div className="relative">
          <select
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value as 'Manager' | 'Agent' | 'Roles')}
            className="px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
          >
            <option value="Roles">Roles</option>
            <option value="Manager">Manager</option>
            <option value="Agent">Agent</option>
          </select>
        </div> */}
      </div>

      {/* Right Section */}
      <div className="relative">
        {/* Search Input */}
        <div className="flex items-center border rounded-lg px-4 py-2 bg-white text-gray-500 focus-within:ring focus-within:ring-green-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m2.6-6.65a8.25 8.25 0 11-16.5 0 8.25 8.25 0 0116.5 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search Agent"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-sm focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}

export default TeamFilterHeader
