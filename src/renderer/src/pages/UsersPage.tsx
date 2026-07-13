import UsersFilter from '@renderer/components/UserFilters';
import UserTable from '@renderer/components/UserTable';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@renderer/api/queries/adminqueries.js';
import UserStat from '@renderer/components/UserStat';
import { useAuth } from '@renderer/context/authContext';
import { apiDateParams, DATE_RANGE_PRESETS, matchesDateRange } from '@renderer/utils/dateRange';
import { useDebouncedValue } from '@renderer/utils/useDebouncedValue';

const UsersPage = () => {
  const [filters, setFilters] = useState({
    gender: 'All',
    category: 'All',
    search: '',
    dateRange: 'All', // New date range filter
  });

  const userCategory = ['All', 'customer', 'agent','other'
  ];
  const { token } = useAuth();
  const { data: userData, isLoading, isError, error } = useQuery({
    queryKey: ['userData'],
    queryFn: () => getAllUsers({ token }),
    enabled: !!token,
  });

  const [dateRangePresetActive, setDateRangePresetActive] = useState(false);
  const debouncedSearch = useDebouncedValue(filters.search.trim(), 400);

  const handleCategoryChange = (category) => {
    setFilters({ ...filters, category });
  };

  const { startDate, endDate } = useMemo(
    () => apiDateParams({ dateRange: filters.dateRange, dateRangePresetActive }),
    [filters.dateRange, dateRangePresetActive]
  );

  // Filter customers based on criteria
  const filteredCustomers = userData?.data.filter((customer) => {
    const matchesGender = filters.gender === 'All' || customer.gender === filters.gender;
    const matchesCategory = filters.category === 'All' || customer.role === filters.category;
    const matchesSearch =
      debouncedSearch === '' ||
      customer.username.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      customer.firstname?.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesDate = matchesDateRange(customer.createdAt, startDate, endDate);

    return matchesGender && matchesCategory && matchesSearch && matchesDate;
  });

  return (
    <div className="p-6 space-y-8 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-[40px] text-gray-800">Users</h1>
        <select
          className="ml-4 px-3 py-2 rounded-lg border border-gray-300 text-gray-800"
          value={filters.dateRange}
          onChange={(e) => {
            setDateRangePresetActive(true);
            setFilters({ ...filters, dateRange: e.target.value });
          }}
        >
          <option value="All">All</option>
          {DATE_RANGE_PRESETS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
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
            className={`px-4 py-2 text-sm font-medium transition ${filters.category === selectedFilter
                ? 'bg-[#147341] text-white'
                : 'text-gray-600 hover:bg-gray-100'
              } border ${selectedFilter === 'All' ? 'rounded-l-lg' : ''
              } ${selectedFilter === 'agent' ? 'rounded-r-lg' : ''
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
