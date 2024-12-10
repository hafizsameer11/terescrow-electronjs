import React, { useState } from "react";

interface Rate {
  date: string;
  time: string;
  rate: string;
  loggedBy: string;
  amount: string;
}

const ratesData: Rate[] = [
  { date: "Nov 7, 2024", time: "10:22 am", rate: "NGN1750/$1", loggedBy: "Dave", amount: "$100\nNGN170,000" },
  { date: "Nov 7, 2024", time: "10:22 am", rate: "NGN1750/$1", loggedBy: "Alex", amount: "$200\nNGN340,000" },
  { date: "Nov 6, 2024", time: "10:00 am", rate: "NGN1800/$1", loggedBy: "Dave", amount: "$50\nNGN90,000" },
  { date: "Nov 5, 2024", time: "9:00 am", rate: "NGN1700/$1", loggedBy: "Chris", amount: "$100\nNGN170,000" },
];

const RatesHistory: React.FC = () => {
  const [filterService, setFilterService] = useState("All Services");
  const [filterDate, setFilterDate] = useState("Last 30 Days");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleFilterData = (): Rate[] => {
    let filteredData = ratesData;

    // Apply "All Services" filter logic (placeholder for future services logic)
    if (filterService !== "All Services") {
      filteredData = filteredData.filter((rate) => rate.loggedBy === filterService);
    }

    // Apply date filtering
    if (filterDate === "Last 7 Days") {
      // Filter logic for "Last 7 Days" (stub for now)
      filteredData = filteredData.filter((rate) => rate.date >= "Nov 1, 2024");
    } else if (filterDate === "Last Year") {
      // Filter logic for "Last Year" (stub for now)
      filteredData = filteredData.filter((rate) => rate.date.includes("2024"));
    }

    return filteredData;
  };

  const filteredData = handleFilterData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Rates</h1>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-600">Rates History</h2>
          <p className="text-sm text-gray-500">View rates history table</p>
        </div>
        <div className="flex gap-4">
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-green-500"
          >
            <option value="All Services">All Services</option>
            <option value="Dave">Dave</option>
            <option value="Alex">Alex</option>
            <option value="Chris">Chris</option>
          </select>

          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-green-500"
          >
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last Year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Rates Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Rate</th>
              <th className="py-3 px-4">Logged by</th>
              <th className="py-3 px-4">Amount</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((rate, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4">{rate.date}</td>
                <td className="py-3 px-4">{rate.time}</td>
                <td className="py-3 px-4">{rate.rate}</td>
                <td className="py-3 px-4">{rate.loggedBy}</td>
                <td className="py-3 px-4">{rate.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg text-sm ${currentPage === 1
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg text-sm ${currentPage === totalPages
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RatesHistory;
