import CustomerFilters from "@renderer/components/CustomerFilters";
import CustomerTable from "@renderer/components/CustomerTable";
import StatsCard from "@renderer/components/StatsCard";
import React, { useState } from "react";

const customers = [
  {
    id: 1,
    name: "Qamardeen Abdulmalik",
    username: "Alucard",
    email: "johndoe@gmail.com",
    mobileNumber: "+234123456789",
    password: "****",
    gender: "Male",
    referralCode: null,
    country: "Nigeria",
    kycStatus: "Successful",
    tier: "Gold",
    dateJoined: "Nov 7, 2024",
    lastPasswordReset: "Nov 1, 2024",
    accountActivities: [],
  },
  // Add more customers here as needed
];

const CustomersPage: React.FC = () => {
  const [filters, setFilters] = useState({
    gender: "All",
    country: "All",
    search: "",
  });

  const filteredCustomers = customers.filter((customer) => {
    const matchesGender =
      filters.gender === "All" || customer.gender === filters.gender;
    const matchesCountry =
      filters.country === "All" || customer.country === filters.country;
    const matchesSearch =
      filters.search === "" ||
      customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      customer.username.toLowerCase().includes(filters.search.toLowerCase());

    return matchesGender && matchesCountry && matchesSearch;
  });

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
          value="15,000"
          change="+1%"
          isPositive={true}
        />
        <StatsCard
          title="Active Now"
          value="20"
          change="+1%"
          isPositive={true}
        />
        <StatsCard
          title="Offline Now"
          value="14,980"
          change="+1%"
          isPositive={true}
        />
        <StatsCard
          title="Total Transactions"
          value="1,500"
          change="-1%"
          isPositive={false}
        />
      </div>
      <div>
        <h2 className="text-[30px] font-normal  text-black">Customers on the app</h2>
        <p className="text-[#00000080] text-[16px] mb-5">
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
