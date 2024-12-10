import React from 'react';

interface TransactionsFilterProps {
  filters: {
    status: string;
    type: string;
    dateRange: string;
    search: string;
    category?: string;
  };
  onChange: (updatedFilters: Partial<TransactionsFilterProps['filters']>) => void;
  title?: string; // Optional title
  subtitle?: string; // Optional subtitle
}

const ChatFilters: React.FC<TransactionsFilterProps> = ({ filters, onChange, title, subtitle }) => {
  const statusOptions = ['All', 'Successful', 'Pending', 'Declined'];
  const typeOption = ['All', 'Buy', 'Sell'];
  const category = ['All', 'Crypto', 'Gift Card'];

  return (
    <>
      <div className="m flex flex-row justify-between">
        <div className="ext">
          {/* Title and Subtitle */}
          <h2 className="text-[30px] font-semibold text-gray-800">
            {title || 'Transactions on the app'}
          </h2>
          <p className="text-sm text-gray-600">
            {subtitle || 'Manage total customers and see their activities'}
          </p>
        </div>
        <div className="filters-top">
          {category.map((status, index) => (
            <button
              key={status}
              className={`px-6 py-2 text-sm font-medium transition ${
                filters.status === status
                  ? 'bg-green-600 text-white'
                  : 'bg- text-gray-600 hover:bg-gray-100 border-gray-300'
              } ${index === 0 ? 'rounded-l-lg' : 'border-l'} ${
                index === statusOptions.length - 1 ? 'rounded-r-lg' : ''
              } ${filters.status === status ? '' : 'border'}`}
              onClick={() => onChange({ status })}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        {/* Status Filter */}
        <div className="flex items-center">
          {statusOptions.map((status, index) => (
            <button
              key={status}
              className={`px-6 py-2 text-sm font-medium transition ${
                filters.status === status
                  ? 'bg-green-600 text-white'
                  : 'bg- text-gray-600 hover:bg-gray-100 border-gray-300'
              } ${index === 0 ? 'rounded-l-lg' : 'border-l'} ${
                index === statusOptions.length - 1 ? 'rounded-r-lg' : ''
              } ${filters.status === status ? '' : 'border'}`}
              onClick={() => onChange({ status })}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex items-center">
          {typeOption.map((serviceType, index) => (
            <button
              key={serviceType}
              className={`px-6 py-2 text-sm font-medium transition ${
                filters.type === serviceType
                  ? 'bg-green-600 text-white'
                  : 'bg- text-gray-600 hover:bg-gray-100 border-gray-300'
              } ${index === 0 ? 'rounded-l-lg' : 'border-l'} ${
                index === typeOption.length - 1 ? 'rounded-r-lg' : ''
              } ${filters.type === status ? '' : 'border'}`}
              onClick={() => onChange({ type: serviceType })}
            >
              {serviceType}
            </button>
          ))}
        </div>

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
    </>
  );
};

export default ChatFilters;
