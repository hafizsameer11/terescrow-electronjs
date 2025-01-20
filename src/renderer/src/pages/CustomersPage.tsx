import { getCustomerStats } from "@renderer/api/queries/admin.chat.queries";
import { gettAllCustomerss } from "@renderer/api/queries/adminqueries";
import CustomerFilters from "@renderer/components/CustomerFilters";
import CustomerTable from "@renderer/components/CustomerTable";
import StatsCard from "@renderer/components/StatsCard";
import { useAuth } from "@renderer/context/authContext";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

// Define the Customer Interface

const CustomersPage: React.FC = () => {
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    gender: "All",
    country: "All",
    search: "",

    startDate: '',
    endDate: '',
  });
  const { data: customerStats } = useQuery({
    queryKey: ['customerStats'],
    queryFn: () => getCustomerStats({ token }),
    enabled: !!token,
  });
  // Fetch customers using React Query
  const { data: customersData, isLoading, isError, error } = useQuery({
    queryKey: ["customersData"],
    queryFn: () => gettAllCustomerss({ token }),
    enabled: !!token,
  });
  // Log fetched data for debugging
  useEffect(() => {
    if (customersData) {
      console.log("Fetched Customers:", customersData.data);
    }
  }, [customersData]);

  // Filter customers based on filters state
  const filteredCustomers = customersData?.data.filter((customer) => {
    const matchesGender =
      filters.gender === "All" || customer.gender === filters.gender;
    const matchesCountry =
      filters.country === "All" || customer.country === filters.country;
    const matchesSearch =
      filters.search === "" ||
      customer.firstname?.toLowerCase().includes(filters.search.toLowerCase()) ||
      customer.lastname?.toLowerCase().includes(filters.search.toLowerCase()) ||
      customer.username?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesDateRange =
      (!filters.startDate || new Date(customer.createdAt) >= new Date(filters.startDate)) &&
      (!filters.endDate || new Date(customer.createdAt) <= new Date(filters.endDate));

    return matchesGender && matchesCountry && matchesSearch && matchesDateRange;
  });

  if (isLoading) return <p>Loading customers...</p>;
  if (isError) return <p>Error fetching customers: {(error as any)?.message}</p>;

  return (
    <div className="w-full mb-10">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[40px] font-normal text-gray-800">Customers</h1>
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm text-gray-700">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatsCard
          title="Total Customers"
          value={customerStats?.data?.totalCustomers?.count || "0"}
          change={`${customerStats?.data?.totalCustomers?.percentage || 0}%`}
          isPositive={customerStats?.data?.totalCustomers?.change === 'positive'}
        />
        <StatsCard
          title="Active Now"
          value={customerStats?.data?.verifiedCustomers?.count || "0"}
          change={`${customerStats?.data?.verifiedCustomers?.percentage || 0}%`}
          isPositive={customerStats?.data?.verifiedCustomers?.change === 'positive'}
        />
        <StatsCard
          title="Offline Now"
          value={customerStats?.data?.offlineNow?.count || "0"}
          change={`${customerStats?.data?.offlineNow?.percentage || 0}%`}
          isPositive={customerStats?.data?.offlineNow?.change === 'positive'}
        />
        <StatsCard
          title="Total Customer Chats"
          value={customerStats?.data?.totalCustomerChats?.count || "0"}
          change={`${customerStats?.data?.totalCustomerChats?.percentage || 0}%`}
          isPositive={customerStats?.data?.totalCustomerChats?.change === 'positive'}
        />
      </div>


      <div>
        <h2 className="text-[30px] font-normal text-black">
          Customers on the app
        </h2>
        <p className="text-[#00000080] text-[16px]">
          Manage total customers and see their activities
        </p>
      </div>

      {/* Filters Section */}
      <CustomerFilters
        filters={filters}
        onChange={(updatedFilters) =>
          setFilters({ ...filters, ...updatedFilters })
        }
      />

      {/* Customer Table */}
      <CustomerTable data={filteredCustomers} />
    </div>
  );
};

export default CustomersPage;
