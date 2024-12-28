import ChatTable from '@renderer/components/ChatTable'
import StatsCard from '@renderer/components/StatsCard'
import TeamCommunicationTable from '@renderer/components/TeamCommunicationTable'
import TeamFilterHeader from '@renderer/components/TeamFilterHeader'
import { useState } from 'react'
// import StatsCard from '@renderer/components/Dashboard/StatsCard';
// import TransactionsTable from '@renderer/components/Dashboard/TransactionsTable';
// import TeamFilterHeader from '@renderer/components/TeamFilterHeader';

const TeamCommunication = () => {
  const sampleData = [
    {
      id: 1,
      name: 'Qamardeen Abdulmalik',
      username: 'Alucard',
      status: 'Active', // Status will determine green or red dot
      role: 'Manager', // Either 'Manager' or 'Agent'
      dateAdded: 'Nov 7, 2024'
    },
    {
      id: 2,
      name: 'Adam Sandler',
      username: 'Adam',
      status: 'Active',
      role: 'Agent',
      dateAdded: 'Nov 7, 2024'
    },
    {
      id: 3,
      name: 'Sasha Sloan',
      username: 'Sasha',
      status: 'Inactive',
      role: 'Agent',
      dateAdded: 'Nov 7, 2024'
    }
  ]

  const [activeTab, setActiveTab] = useState<'Active' | 'Deleted'>('Active')
  const [selectedRole, setSelectedRole] = useState<'Manager' | 'Agent' | 'Roles'>('Roles')
  const [searchValue, setSearchValue] = useState('')

  const handleTabChange = (tab: 'Active' | 'Deleted') => {
    setActiveTab(tab)
  }

  const handleRoleChange = (role: 'Manager' | 'Agent' | 'Roles') => {
    setSelectedRole(role)
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
  }

  // Filter the data dynamically based on filters
  const filteredData = sampleData.filter((member) => {
    // Match the `activeTab` to filter by status
    const matchesTab =
      activeTab === 'Active' ? member.status === 'Active' : member.status === 'Inactive'

    // Match the `selectedRole` to filter by role
    const matchesRole = selectedRole === 'Roles' || member.role === selectedRole

    // Match the `searchValue` to filter by name or username
    const matchesSearch =
      searchValue === '' ||
      member.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      member.username.toLowerCase().includes(searchValue.toLowerCase())

    return matchesTab && matchesRole && matchesSearch
  })

  return (
    <>
      <div className="p-6 space-y-8 w-full">
        {/* Header */}
        <div className="flex justify-between items-center py-4">
          {/* Title */}
          <h1 className="text-[40px] text-gray-800">Teams</h1>

          {/* Button
          <button className="px-4 py-2 text-sm text-white bg-green-700 rounded-lg hover:bg-green-800">
            Add new Team
          </button> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Team members" value="20" change="+1%" isPositive={true} />
          <StatsCard title="Online " value="15" />
          <StatsCard title="Offline" value="3" />
          <StatsCard title="Left Out" value="2" />
        </div>

        {/* Transactions Table */}
        <div>
          <TeamFilterHeader
            activeTab={activeTab}
            selectedRole={selectedRole}
            searchValue={searchValue}
            onTabChange={handleTabChange}
            onRoleChange={handleRoleChange}
            onSearchChange={handleSearchChange}
          />
          <TeamCommunicationTable data={filteredData} isTeam={true} isTeamCommunition={true}  />
        </div>
      </div>
    </>
  )
}

export default TeamCommunication
