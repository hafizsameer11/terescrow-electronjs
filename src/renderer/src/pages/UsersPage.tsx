import UsersFilter from '@renderer/components/UserFilters';
import UserTable from '@renderer/components/UserTable';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@renderer/api/queries/adminqueries.js';
import UserStat from '@renderer/components/UserStat';
import { useAuth } from '@renderer/context/authContext';

const UsersPage = () => {
  const [filters, setFilters] = useState({
    gender: 'All',
    category: 'All',
    search: '',
    dateRange: 'All', // New date range filter
  });

  const userCategory = ['All', 'customer', 'agent'];
  const {token}=useAuth();
  const { data: userData, isLoading, isError, error } = useQuery({
    queryKey: ['userData'],
    queryFn: () => getAllUsers({ token }),
    enabled: !!token,
  });

  const handleCategoryChange = (category) => {
    setFilters({ ...filters, category });
  };

  // Helper function to calculate date ranges
  const calculateDateRange = (range) => {
    const today = new Date();
    switch (range) {
      case 'Last 30 days':
        return [new Date(today.setDate(today.getDate() - 30)), new Date()];
      case 'Last 15 days':
        return [new Date(today.setDate(today.getDate() - 15)), new Date()];
      case 'Last 7 days':
        return [new Date(today.setDate(today.getDate() - 7)), new Date()];
      default:
        return [null, null]; // No filtering
    }
  };

  // Filter customers based on criteria
  const filteredCustomers = userData?.data.filter((customer) => {
    const matchesGender = filters.gender === 'All' || customer.gender === filters.gender;
    const matchesCategory = filters.category === 'All' || customer.role === filters.category;
    const matchesSearch =
      filters.search === '' ||
      customer.username.toLowerCase().includes(filters.search.toLowerCase()) ||
      customer.firstname?.toLowerCase().includes(filters.search.toLowerCase());

    const [startDate, endDate] = calculateDateRange(filters.dateRange);
    const matchesDate =
      !startDate || !endDate || (new Date(customer.createdAt) >= startDate && new Date(customer.createdAt) <= endDate);

    return matchesGender && matchesCategory && matchesSearch && matchesDate;
  });

  return (
    <div className="p-6 space-y-8 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-[40px] text-gray-800">Users</h1>
        <select
          className="ml-4 px-3 py-2 rounded-lg border border-gray-300 text-gray-800"
          value={filters.dateRange}
          onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
        >
          <option value="All">All</option>
          <option value="Last 30 days">Last 30 days</option>
          <option value="Last 15 days">Last 15 days</option>
          <option value="Last 7 days">Last 7 days</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        <UserStat
          title="All Users"
          value={userData?.data.length || 0}
          change="15%"
          showStats={true}
        />
        <UserStat
          title="Customers"
          value={
            userData?.data.filter((user) => user.role === 'customer').length || 0
          }
        />
        <UserStat
          title="Agents"
          value={userData?.data.filter((user) => user.role === 'agent').length || 0}
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
            } border ${
              selectedFilter === 'All' ? 'rounded-l-lg' : ''
            } ${
              selectedFilter === 'agent' ? 'rounded-r-lg' : ''
            }`}
          >
            {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
          </button>
        ))}
      </div>

      {/* Filters Component */}
      <UsersFilter
        filters={filters}
        onChange={(updatedFilters) =>
          setFilters({ ...filters, ...updatedFilters })
        }
      />

      <UserTable data={filteredCustomers || []} />
    </div>
  );
};

export default UsersPage;
