import { gettAllCustomerss } from "@renderer/api/queries/adminqueries";
import CustomerFilters from "@renderer/components/CustomerFilters";
import CustomerTable from "@renderer/components/CustomerTable";
import StatsCard from "@renderer/components/StatsCard";
import { useAuth } from "@renderer/context/authContext";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

// Define the Customer Interface

const CustomersPage: React.FC = () => {
  const {token}=useAuth();
  const [filters, setFilters] = useState({
    gender: "All",
    country: "All",
    search: "",
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

    return matchesGender && matchesCountry && matchesSearch;
  });

  if (isLoading) return <p>Loading customers...</p>;
  if (isError) return <p>Error fetching customers: {(error as any)?.message}</p>;

  return (
    <div className="w-full mb-10">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[40px] font-normal text-gray-800">Customers</h1>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatsCard
          title="Total Customers"
          value={customersData?.data.length|| "0"}
          change="+1%"
          isPositive={true}
        />
        <StatsCard
          title="Active Now"
          value="20" // Example static value
          change="+1%"
          isPositive={true}
        />
        <StatsCard
          title="Offline Now"
          value="14,980" // Example static value
          change="+1%"
          isPositive={true}
        />
        <StatsCard
          title="Total Transactions"
          value="1,500" // Example static value
          change="-1%"
          isPositive={false}
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
      <CustomerTable data={filteredCustomers } />
    </div>
  );
};

export default CustomersPage;
