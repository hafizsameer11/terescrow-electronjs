import React from "react";

interface ChatFiltersProps {
  filters: {
    status: string;
    transactionType: string;
    search: string;
  };
  onChange: (updatedFilters: Partial<ChatFiltersProps["filters"]>) => void;
}

const ChatFilters: React.FC<ChatFiltersProps> = ({ filters, onChange }) => {
  const statusOptions = [
    "All",
    "Completed",
    "Pending",
    "Declined",
    "Unsuccessful",
    "Unanswered",
  ];

  const transactionTypes = ["Buy", "Sell"];

  return (
    <div className="flex flex-wrap justify-between items-center mb-4">
      {/* Status Filter */}
      <div className="flex items-center">
        {statusOptions.map((status, index) => (
          <button
            key={index}
            className={`px-4 py-2 text-sm font-medium transition ${
              filters.status === status
                ? "bg-[#147341] text-white"
                : "text-gray-600 hover:bg-gray-100"
            } border ${index === 0 ? "rounded-l-lg" : ""} ${
              index === statusOptions.length - 1 ? "rounded-r-lg" : ""
            }`}
            onClick={() => onChange({ status })}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Transaction Type Filter */}
      <div className="flex items-center">
        {transactionTypes.map((type, index) => (
          <button
            key={index}
            className={`px-4 py-2 text-sm font-medium transition ${
              filters.transactionType === type
                ? "bg-[#147341] text-white"
                : "text-gray-600 hover:bg-gray-100"
            } border ${index === 0 ? "rounded-l-lg" : ""} ${
              index === transactionTypes.length - 1 ? "rounded-r-lg" : ""
            }`}
            onClick={() => onChange({ transactionType: type })}
          >
            {type}
          </button>
        ))}
      </div>

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
  );
};

export default ChatFilters;
