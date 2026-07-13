import { getCustomerStats } from "@renderer/api/queries/admin.chat.queries";
import { gettAllCustomerss } from "@renderer/api/queries/adminqueries";
import type { PaginatedCustomersPayload } from "@renderer/api/queries/datainterfaces";
import CustomerFilters from "@renderer/components/CustomerFilters";
import CustomerTable from "@renderer/components/CustomerTable";
import StatsCard from "@renderer/components/StatsCard";
import { useAuth } from "@renderer/context/authContext";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { useDebouncedValue } from "@renderer/utils/useDebouncedValue";
import ListFetchingIndicator from "@renderer/components/ListFetchingIndicator";

function isPaginatedCustomersPayload(
  data: unknown
): data is PaginatedCustomersPayload {
  return (
    typeof data === "object" &&
    data !== null &&
    "data" in data &&
    Array.isArray((data as PaginatedCustomersPayload).data)
  );
}

const CustomersPage: React.FC = () => {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    gender: "All",
    country: "All",
    search: "",
    startDate: '',
    endDate: '',
  });

  /** Only send dates to API when admin explicitly picks them in the date inputs. */
  const apiStartDate = filters.startDate.trim() || undefined;
  const apiEndDate = filters.endDate.trim() || undefined;
  const debouncedSearch = useDebouncedValue(filters.search.trim(), 400);

  const { data: customerStats } = useQuery({
    queryKey: ['customerStats'],
    queryFn: () => getCustomerStats({ token }),
    enabled: !!token,
  });

  const { data: customersData, isLoading, isError, error, isFetching } = useQuery({
    queryKey: [
      "customersData",
      page,
      filters.gender,
      filters.country,
      debouncedSearch,
      apiStartDate,
      apiEndDate,
    ],
    queryFn: () =>
      gettAllCustomerss({
        token,
        page,
        limit: 20,
        gender: filters.gender,
        country: filters.country,
        search: debouncedSearch || undefined,
        startDate: apiStartDate,
        endDate: apiEndDate,
      }),
    enabled: !!token,
    placeholderData: keepPreviousData,
  });

  const payload = customersData?.data;
  const customers = isPaginatedCustomersPayload(payload)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : [];
  const totalPages = isPaginatedCustomersPayload(payload) ? payload.totalPages : 1;

  const initialLoad = isLoading && !customersData;

  if (initialLoad) return <p className="p-6 text-gray-600">Loading customers...</p>;
  if (isError) return <p className="p-6 text-red-600">Error fetching customers: {(error as Error)?.message}</p>;

  return (
    <div className="w-full mb-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[40px] font-normal text-gray-800">Customers</h1>
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm text-gray-700">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                setPage(1);
                setFilters((prev) => ({ ...prev, startDate: e.target.value }));
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                setPage(1);
                setFilters((prev) => ({ ...prev, endDate: e.target.value }));
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-800"
            />
          </div>
        </div>
      </div>

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
        <StatsCard
          title="Today's Customer"
          value={customerStats?.data?.todayCustomers?.count || "0"}
          change={`${customerStats?.data?.todayCustomers?.percentage || 0}%`}
          isPositive={customerStats?.data?.todayCustomers?.change === 'positive'}
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

      <CustomerFilters
        filters={filters}
        onChange={(updatedFilters) => {
          setPage(1);
          setFilters({ ...filters, ...updatedFilters });
        }}
      />

      <ListFetchingIndicator show={isFetching && !initialLoad} />

      <CustomerTable
        data={customers}
        serverPagination={{
          currentPage: page,
          totalPages,
          onPageChange: setPage,
        }}
      />
    </div>
  );
};

export default CustomersPage;
