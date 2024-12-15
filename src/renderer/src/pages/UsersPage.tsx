import UsersFilter from '@renderer/components/UserFilters'
import UserTable from '@renderer/components/UserTable'
import { useState } from 'react'
import { DUMMY_USERS } from '../utils/dummyUsers.js'
import UserStat from '@renderer/components/UserStat.js'
import { useQuery } from '@tanstack/react-query'
import { getAllUsers } from '@renderer/api/queries/adminqueries.js'
import { token } from '@renderer/api/config.js'

const UsersPage = () => {
  const [filters, setFilters] = useState({
    gender: 'All',
    category: 'All',
    search: ''
  })

  const userCategory = ['All', 'Customer', 'Team']
  // const { data: teamData, isLoading, isError, error } = useQuery({
  //   queryKey: ['teamData'],
  //   queryFn: () => getTeam({ token }),
  //   enabled: !!token,
  // });
  const {data:userData, isLoading, isError, error} = useQuery({
    queryKey: ['userData'],
    queryFn: () => getAllUsers({ token }),
    enabled: !!token,
  })
  const handleCategoryChange = (category) => {
    setFilters({ ...filters, category })
  }

  const filteredCustomers = DUMMY_USERS.filter((customer) => {
    const matchesGender = filters.gender === 'All' || customer.gender === filters.gender
    const matchesCategory = filters.category === 'All' || customer.category === filters.category
    const matchesSearch =
      filters.search === '' ||
      customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      customer.username.toLowerCase().includes(filters.search.toLowerCase())

    return matchesGender && matchesCategory && matchesSearch
  })

  return (
    <div className="p-6 space-y-8 w-full">
      <div className="flex items-center justify-between">
        {/* Header */}
        <h1 className="text-[40px] text-gray-800">Users</h1>

        {/* Dropdown */}
        <select className="ml-4 px-3 py-2 rounded-lg border border-gray-300 text-gray-800">
          <option>Last 30 days</option>
          <option>Last 15 days</option>
          <option>Last 7 days</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        <UserStat title="All Users" value={DUMMY_USERS.length} change="15%" showStats={true} />
        <UserStat
          title="Customers"
          value={DUMMY_USERS.filter((user) => user.category === 'Customer').length}
        />
        <UserStat
          title="Team"
          value={DUMMY_USERS.filter((user) => user.category === 'Team').length}
        />
      </div>

      {/* Category Filters */}
      <div className="flex items-center">
        {userCategory.map((selectedFilter) => (
          <button
            key={selectedFilter}
            onClick={() => handleCategoryChange(selectedFilter)}
            className={`px-4 py-2 text-sm font-medium transition ${
              filters.category === selectedFilter
                ? 'bg-[#147341] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            } border ${selectedFilter === 'All' ? 'rounded-l-lg' : ''} ${
              selectedFilter === 'Team' ? 'rounded-r-lg' : ''
            }`}
          >
            {selectedFilter}
          </button>
        ))}
      </div>

        {/* Filters Component */}
        <UsersFilter
          filters={filters}
          onChange={(updatedFilters) => setFilters({ ...filters, ...updatedFilters })}
        />

        <UserTable data={userData?.data} />
    </div>
  )
}

export default UsersPage
