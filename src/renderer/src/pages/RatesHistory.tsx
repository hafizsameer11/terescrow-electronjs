import { token } from "@renderer/api/config";
import { getRate } from "@renderer/api/queries/adminqueries";
import { Rate } from "@renderer/api/queries/datainterfaces";
import { formatDateTime } from "@renderer/utils/customfunctions";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

const RatesHistory: React.FC = () => {
  const [filterService, setFilterService] = useState("All Services");
  const [filterDate, setFilterDate] = useState("Last 30 Days");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: ratesData, isLoading, isError, error } = useQuery({
    queryKey: ["ratesData"],
    queryFn: () => getRate({ token }),
    enabled: !!token,
  });

  // Extract date and time from createdAt

  const handleFilterData = (): Rate[] => {
    let filteredData = ratesData?.data || [];

    if (filterService !== "All Services") {
      filteredData = filteredData.filter((rate) => rate.agent === filterService);
    }

    if (filterDate === "Last 7 Days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filteredData = filteredData.filter(
        (rate) => new Date(rate.createdAt || "") >= sevenDaysAgo
      );
    } else if (filterDate === "Last Year") {
      const currentYear = new Date().getFullYear();
      filteredData = filteredData.filter(
        (rate) => new Date(rate.createdAt || "").getFullYear() === currentYear
      );
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
      <h1 className="text-[40px] font-semibold text-gray-800 mb-4">Rates</h1>

      <div className="flex justify-between items-center mb-6">
        {/* <div>
          <h2 className="text-[30px] font-medium text-gray-600">Rates History</h2>
          <p className="text-[20px] text-gray-500">View rates history table</p>
        </div> */}
        <div className="flex gap-4">
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-green-500"
          >
            <option value="All Services">All Services</option>
            {ratesData?.data?.map((rate) => (
              <option key={rate.agent} value={rate.agent}>
                {rate.agent}
              </option>
            ))}
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
            {paginatedData.map((rate, index) => {
              const { date, time } = formatDateTime(rate.createdAt || "");
              return (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{date}</td>
                  <td className="py-3 px-4">{time}</td>
                  <td className="py-3 px-4">NGN{rate.rate}/$1</td>
                  <td className="py-3 px-4">{rate.agent}</td>
                  <td className="py-3 px-4">
                    ${rate.amount} / NGN{rate.amountNaira}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg text-sm ${
            currentPage === 1
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
          className={`px-4 py-2 rounded-lg text-sm ${
            currentPage === totalPages
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
