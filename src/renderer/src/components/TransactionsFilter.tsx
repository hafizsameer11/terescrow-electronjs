import React from 'react';
import { FiSearch } from "react-icons/fi"; // Importing the search icon

interface TransactionsFilterProps {
  filters: {
    status: string;
    type: string;
    dateRange: string;
    search: string;
    category?: string;
  };
  title?: string;
  subTitle?: string;
  onChange: (updatedFilters: Partial<TransactionsFilterProps['filters']>) => void;
}

const TransactionsFilter: React.FC<TransactionsFilterProps> = ({ filters, onChange, title, subTitle }) => {
  const statusOptions = ['All', 'Successful', 'Pending', 'Declined'];
  const typeOption = ['All', 'Buy', 'Sell'];
  const category = ['All', 'Crypto', 'Gift Card']
  return (
    <>
      <div className="m flex flex-row justify-between">
        <div className="ext">
          {/* Use provided title or fallback to default */}
          <h2 className="text-[36px] font-semibold text-gray-800">
            {title || "Transactions on the app"}
          </h2>
          {/* Use provided subtitle or fallback to default */}
          <p className="text-[16px] text-gray-600 mb-5">
            {subTitle || "Manage total customers and see their activities"}
          </p>
        </div>
        <div className="filters-top">
          {category.map((status, index) => (
            <button
              key={status}
              className={`px-6 py-2 text-sm font-medium transition ${filters.status === status
                ? 'bg-[#147341] text-white'
                : 'bg- text-gray-600 hover:bg-gray-100 border-gray-300'
                } ${index === 0 ? 'rounded-l-lg' : 'border-l'
                } ${index === statusOptions.length - 1 ? 'rounded-r-lg' : ''
                } ${filters.status === status ? '' : 'border'
                }`}
              onClick={() => onChange({ status })}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      <div className="flex  items-center justify-between">
        {/* Status Filter */}
        <div className="flex items-center">
          {statusOptions.map((status, index) => (
            <button
              key={status}
              className={`px-6 py-2 text-sm font-medium transition ${filters.status === status
                ? 'bg-[#147341] text-white'
                : 'bg- text-gray-600 hover:bg-gray-100 border-gray-300'
                } ${index === 0 ? 'rounded-l-lg' : 'border-l'
                } ${index === statusOptions.length - 1 ? 'rounded-r-lg' : ''
                } ${filters.status === status ? '' : 'border'
                }`}
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
              className={`px-6 py-2 text-sm font-medium transition ${filters.type === serviceType
                ? 'bg-[#147341] text-white'
                : 'bg- text-gray-600 hover:bg-gray-100 border-gray-300'
                } ${index === 0 ? 'rounded-l-lg' : 'border-l'
                } ${index === typeOption.length - 1 ? 'rounded-r-lg' : ''
                } ${filters.type === status ? '' : 'border'
                }`}
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
        <div className="flex items-center border bg-white border-gray-300 rounded-full px-4 py-2 w-[250px] shadow-sm">
          <FiSearch className="h-5 w-5 text-gray-400 mr-2" /> {/* React Icon */}
          <input
            type="text"
            placeholder="Search"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="outline-none text-sm text-gray-600 w-full bg-transparent placeholder-gray-400"
          />
        </div>


      </div>
    </>

  );
};

export default TransactionsFilter;
