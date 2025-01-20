import React from 'react';

interface TransactionsFilterProps {
  filters: {
    status: string;
    type: string;
    dateRange: string;
    search: string;
    category: string;
  };
  onChange: (updatedFilters: Partial<TransactionsFilterProps['filters']>) => void;
  title?: string;
  subtitle?: string;
}

const ChatFilters: React.FC<TransactionsFilterProps> = ({ filters, onChange, title, subtitle }) => {
  const statusOptions = ['All', 'successful', 'pending', 'declined', 'unsucessful'];
  const typeOptions = ['All', 'buy', 'sell'];
  const categoryOptions = ['All', 'crypto', 'giftCard']; // Correct category options

  return (
    <div>
      <div className="m flex flex-row justify-between">
        <div className="ext">
          <h2 className="text-[30px] font-semibold text-gray-800 ">
            {title || 'Transactions on the app'}
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            {subtitle || 'Manage total customers and see their activities'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {statusOptions.map((status, index) => (
            <button
              key={status}
              className={`px-6 py-2 text-sm font-medium transition ${filters.status === status
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${index === 0 ? 'rounded-l-lg' : 'border-l'} ${index === statusOptions.length - 1 ? 'rounded-r-lg' : ''
                }`}
              onClick={() => onChange({ status })}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex items-center">
          {typeOptions.map((type, index) => (
            <button
              key={type}
              className={`px-6 py-2 text-sm font-medium transition ${filters.type === type
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${index === 0 ? 'rounded-l-lg' : 'border-l'} ${index === typeOptions.length - 1 ? 'rounded-r-lg' : ''
                }`}
              onClick={() => onChange({ type })}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center">
          {categoryOptions.map((category, index) => (
            <button
              key={category}
              className={`px-6 py-2 text-sm font-medium transition ${filters.category === category
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${index === 0 ? 'rounded-l-lg' : 'border-l'} ${index === categoryOptions.length - 1 ? 'rounded-r-lg' : ''
                }`}
              onClick={() => onChange({ category })}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/* Date Range Dropdown */}
        <select
          value={filters.dateRange}
          onChange={(e) => onChange({ dateRange: e.target.value })}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {['Last 7 days', 'Last 30 days', 'Last 90 days'].map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>

        {/* Search Bar */}
        <div className="flex items-center border bg-white border-gray-300 rounded-lg px-4 py-2 w-100">
          <input
            type="text"
            placeholder="Search"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="outline-none text-sm text-gray-600 w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatFilters;
