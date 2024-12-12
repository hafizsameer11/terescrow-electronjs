import React from 'react'

interface CustomerFiltersProps {
  filters: {
    gender: string
    category: string
    search: string
  }
  onChange: (updatedFilters: Partial<CustomerFiltersProps['filters']>) => void
}

const UsersFilter: React.FC<CustomerFiltersProps> = ({ filters, onChange }) => {
  const genderOptions = ['All', 'Male', 'Female']
  const categoryOptions = ['All', 'Team', 'Customer'] // Add more countries if needed

  return (
    <div className="flex flex-wrap justify-between items-center mb-4">
      {/* Gender Filter */}
      <div className="flex items-center">
        {genderOptions.map((gender) => (
          <button
            key={gender}
            className={`px-4 py-2 text-sm font-medium transition ${
              filters.gender === gender
                ? 'bg-[#147341] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            } border ${gender === 'All' ? 'rounded-l-lg' : ''} ${
              gender === 'Female' ? 'rounded-r-lg' : ''
            }`}
            onClick={() => onChange({ gender })}
          >
            {gender}
          </button>
        ))}
      </div>
      <div className='flex'>
        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 me-10"
        >
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* Search Bar */}
        <div className="flex items-center border bg-white border-gray-300 rounded-lg px-4 py-2 w-100">
          <input
            type="text"
            placeholder="Search customer"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="outline-none text-sm text-gray-600 w-full"
          />
        </div>
      </div>
    </div>
  )
}

export default UsersFilter
