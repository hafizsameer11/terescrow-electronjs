import React from "react";

interface CustomerFiltersProps {
  filters: {
    gender: string;
    country: string;
    search: string;
  };
  onChange: (updatedFilters: Partial<CustomerFiltersProps["filters"]>) => void;
}

const CustomerFilters: React.FC<CustomerFiltersProps> = ({ filters, onChange }) => {
  const genderOptions = ["All", "Male", "Female"];
  const countryOptions = ["All", "Nigeria", "USA", "Canada"]; // Add more countries if needed

  return (
    <div className="flex flex-wrap justify-between items-center mb-4">
      {/* Gender Filter */}
      <div className="flex items-center">
        {genderOptions.map((gender) => (
          <button
            key={gender}
            className={`px-4 py-2 text-sm font-medium transition ${
              filters.gender === gender ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"
            } border ${gender === "All" ? "rounded-l-lg" : ""} ${
              gender === "Female" ? "rounded-r-lg" : ""
            }`}
            onClick={() => onChange({ gender })}
          >
            {gender}
          </button>
        ))}
      </div>

      {/* Country Filter */}
      <select
        value={filters.country}
        onChange={(e) => onChange({ country: e.target.value })}
        className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {countryOptions.map((country) => (
          <option key={country} value={country}>
            {country}
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
  );
};

export default CustomerFilters;
