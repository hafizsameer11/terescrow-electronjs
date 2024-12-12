import { useState } from 'react'
import { DUMMY_USERS } from '../utils/dummyUsers.js'
import UserStat from '@renderer/components/UserStat.js'
import TeamsTable from '@renderer/components/TeamsTable.js'

const DUMMY_TEAM_MEMBERS = [
  {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    dateAdded: '2024-01-15',
    role: 'Admin'
  },
  {
    id: 2,
    name: 'Jane Smith',
    username: 'janesmith',
    dateAdded: '2024-02-20',
    role: 'Manager'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    username: 'mikejohnson',
    dateAdded: '2024-03-10',
    role: 'Developer'
  },
  {
    id: 4,
    name: 'Sarah Williams',
    username: 'sarahwilliams',
    dateAdded: '2024-04-05',
    role: 'Designer'
  },
  {
    id: 5,
    name: 'Alex Brown',
    username: 'alexbrown',
    dateAdded: '2024-05-22',
    role: 'Support'
  }
]

const Teams = () => {
  const [filters, setFilters] = useState({
    categoryType: 'Active',
    category: 'All',
    search: ''
  })

  const categoryOptions = ['All', 'Team', 'Customer']

  const userCategoryType = ['Active', 'Declined']

  const handleCategoryTypeChange = (categoryType) => {
    setFilters((prev) => ({ ...prev, categoryType }))
  }

  const handleCategoryChange = (category) => {
    setFilters((prev) => ({ ...prev, category }))
  }

  const handleSearchChange = (search) => {
    setFilters((prev) => ({ ...prev, search }))
  }

  const [searchTerm, setSearchTerm] = useState('')

  // Filter function to search through team members
  const filteredTeamMembers = DUMMY_TEAM_MEMBERS.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-8 w-full">
      <div className="flex items-center justify-between">
        {/* Header */}
        <h1 className="text-[40px] text-gray-800">Teams</h1>

        <button className="bg-green-800 text-white py-2 px-3 rounded-lg">Add team member</button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        <UserStat
          title="Total Team Members"
          value={DUMMY_USERS.length}
          change="15%"
          showStats={true}
        />
        <UserStat title="Online" value="15" />
        <UserStat title="Offline" value="5" />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex">
          {/* CategoryType Filters */}
          <div className="flex me-8">
            {userCategoryType.map((selectedFilter) => (
              <button
                key={selectedFilter}
                onClick={() => handleCategoryTypeChange(selectedFilter)}
                className={`px-4 py-2 text-sm font-medium transition ${
                  filters.categoryType === selectedFilter
                    ? 'bg-[#147341] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                } border ${selectedFilter === 'Active' ? 'rounded-l-lg' : ''} ${
                  selectedFilter === 'Declined' ? 'rounded-r-lg' : ''
                }`}
              >
                {selectedFilter}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <div className="flex items-center border bg-white border-gray-300 rounded-lg px-4 py-2 w-1/4">
          <input
            type="text"
            placeholder="Search customer"
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none text-sm text-gray-600 w-full"
          />
        </div>
      </div>

      {/* User Table */}
      <TeamsTable data={filteredTeamMembers} />
    </div>
  )
}

export default Teams
