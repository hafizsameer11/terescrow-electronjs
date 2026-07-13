import React from 'react';
import { FiSearch } from 'react-icons/fi';

export interface ChatFiltersState {
  status: string;
  type: string;
  dateRange: string;
  search: string;
  category: string;
  transactionType?: string;
}

interface ChatFiltersProps {
  filters: ChatFiltersState;
  onChange: (updatedFilters: Partial<ChatFiltersState>) => void;
  title?: string;
  subtitle?: string;
  /** Legacy: category row + date dropdown. Chats hub: compact toolbar like design mock. */
  layout?: 'legacy' | 'chatsHub';
  showCategoryRow?: boolean;
}

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: 'All' },
  { label: 'Successful', value: 'successful' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Declined', value: 'declined' },
  { label: 'Unsuccessful', value: 'unsucessful' },
];

const ChatFilters: React.FC<ChatFiltersProps> = ({
  filters,
  onChange,
  title,
  subtitle,
  layout = 'legacy',
  showCategoryRow = true,
}) => {
  const typeOptions = ['All', 'buy', 'sell'];
  const categoryOptions = ['All', 'crypto', 'giftCard'];

  if (layout === 'chatsHub') {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{title || 'Chat History'}</h2>
          {subtitle ? (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_TABS.map((tab) => {
              const active = filters.status === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  className={`px-5 py-2 text-sm font-medium rounded-lg border transition ${
                    active
                      ? 'bg-[#147341] text-white border-[#147341]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => onChange({ status: tab.value })}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
              {(['All', 'buy', 'sell'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`px-6 py-2 text-sm font-medium capitalize ${
                    filters.type === t ? 'bg-[#147341] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => onChange({ type: t, transactionType: t })}
                >
                  {t}
                </button>
              ))}
            </div>

            <select
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white min-w-[140px] appearance-none bg-[length:12px] pr-8"
              style={{ backgroundImage: 'none' }}
              aria-label="Bulk actions"
              defaultValue=""
            >
              <option value="">Bulk Select</option>
              <option value="noop" disabled>
                Use checkboxes in the table
              </option>
            </select>

            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white min-w-[220px] flex-1 max-w-md">
              <FiSearch className="text-gray-400 shrink-0 mr-2" />
              <input
                type="text"
                placeholder="Search customer"
                value={filters.search}
                onChange={(e) => onChange({ search: e.target.value })}
                className="outline-none text-sm text-gray-700 w-full bg-transparent"
              />
            </div>
          </div>
        </div>

        {showCategoryRow && (
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((category) => (
              <button
                key={category}
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                  filters.category === category
                    ? 'bg-[#147341] text-white border-[#147341]'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                onClick={() => onChange({ category })}
              >
                {category === 'giftCard' ? 'Gift card' : category}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="m flex flex-row justify-between">
        <div className="ext">
          <h2 className="text-[30px] font-semibold text-gray-800 ">{title || 'Transactions on the app'}</h2>
          <p className="text-sm text-gray-600 mb-5">{subtitle || 'Manage total customers and see their activities'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center flex-wrap">
          {STATUS_TABS.map((tab, index) => (
            <button
              key={tab.value}
              className={`px-6 py-2 text-sm font-medium transition ${
                filters.status === tab.value
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${index === 0 ? 'rounded-l-lg' : 'border-l'} ${index === STATUS_TABS.length - 1 ? 'rounded-r-lg' : ''}`}
              onClick={() => onChange({ status: tab.value })}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center">
          {typeOptions.map((type, index) => (
            <button
              key={type}
              className={`px-6 py-2 text-sm font-medium transition ${
                filters.type === type ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${index === 0 ? 'rounded-l-lg' : 'border-l'} ${index === typeOptions.length - 1 ? 'rounded-r-lg' : ''}`}
              onClick={() => onChange({ type })}
            >
              {type}
            </button>
          ))}
        </div>

        {showCategoryRow && (
          <div className="flex items-center">
            {categoryOptions.map((category, index) => (
              <button
                key={category}
                className={`px-6 py-2 text-sm font-medium transition ${
                  filters.category === category
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${index === 0 ? 'rounded-l-lg' : 'border-l'} ${index === categoryOptions.length - 1 ? 'rounded-r-lg' : ''}`}
                onClick={() => onChange({ category })}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
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

        <div className="flex items-center border bg-white border-gray-300 rounded-lg px-4 py-2 flex-1 max-w-md">
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
