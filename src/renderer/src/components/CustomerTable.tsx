import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NewNotificationModal from "./modal/NewNotificationModal";
import NotificationHistoryModal from "./modal/NotificationHistoryModal";
import { InappNotification } from "@renderer/api/queries/datainterfaces";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chnageUserStatus } from "@renderer/api/queries/adminqueries";
import { useAuth } from "@renderer/context/authContext";

interface Customer {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phoneNumber: string;
  gender: string;
  country: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  inappNotification?: InappNotification[]
  status: string
  KycStateTwo?: {
    state: string
  }
}

interface CustomerTableProps {
  data: Customer[];
}

const CustomerTable: React.FC<CustomerTableProps> = ({ data }) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] =
    useState<boolean>(false);
  const [isNewNotificationModalOpen, setIsNewNotificationModalOpen] =
    useState<boolean>(false);
  const [notifications, setNotifications] = useState<InappNotification[]>([]);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null); // Close the active menu
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(data?.length / itemsPerPage);
  const paginatedData = data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleMenu = (id: number) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const { mutate: mutation, isPending } = useMutation({

    mutationFn: (data: { id: number, status: string }) => chnageUserStatus({ id: data.id.toString(), data: { status: data.status }, token: token }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['customersData']);
      alert(data.message);
    },
    onError: () => alert('Failed to change status.'),
  })
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleNewNotificationClick = () => {
    setIsNotificationModalOpen(false);
    setIsNewNotificationModalOpen(true);
  };
  const handleNotificationModalClick = (item: Customer) => {
    setNotifications(item?.inappNotification || [])
    setIsNotificationModalOpen(true);
  }
  const hanldeStatusChange = (id: number, status: string) => {
    console.log('status', status)
    mutation({ id, status })
  }
  // const handleNewNotificationSubmit = (formData: {
  //   title: string;
  //   message: string;
  //   image: File | null;
  // }) => {
  //   console.log("New Notification Data:", formData);
  //   setIsNewNotificationModalOpen(false);
  //   setNotifications((prev) => [
  //     ...prev,
  //     {
  //       id: prev.length + 1,
  //       content: formData.title,
  //       date: new Date().toLocaleString(),
  //       sentBy: "You",
  //       status: "Pending",
  //     },
  //   ]);
  // };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md">
      <table className="min-w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="py-3 px-4">Name, Username</th>
            <th className="py-3 px-4">Email</th>
            <th className="py-3 px-4">Phone Number</th>
            <th className="py-3 px-4">Country</th>
            <th className="py-3 px-4">Gender</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-1"></th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((customer) => (
            <tr
              key={customer.id}
              className="border-t hover:bg-gray-50 relative"
            >
              <td className="py-3 px-4">
                <div>
                  <span className="font-semibold">
                    {customer.firstname} {customer.lastname}
                  </span>
                  <span className="text-sm text-gray-500">
                    {" "}
                    ({customer.username})
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">{customer.email}</td>
              <td className="py-3 px-4">{customer.phoneNumber}</td>
              <td className="py-3 px-4">{customer.country}</td>
              <td className="py-3 px-4">{customer.gender}</td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 text-xs rounded-lg ${customer?.KycStateTwo?.state === 'verified'
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                    }`}
                >
                  {customer?.KycStateTwo?.state === 'verified' ? "Verified" : customer?.KycStateTwo?.state === 'pending' ? "pending" : customer?.KycStateTwo?.state === 'failed' ? "failed" : "Not Verified"}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={() => toggleMenu(customer.id)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  &#x22EE;
                </button>
                {activeMenu === customer.id && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 mt-2 bg-white rounded-md shadow-lg z-50"
                    style={{ width: "240px" }}
                  >
                    <button
                      onClick={() => navigate(`/customers/${customer.id}`)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      View Customer Details
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/transaction-details/${customer.id}`)
                      }
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      View Transaction Details
                    </button>
                    <button
                      onClick={() => handleNotificationModalClick(customer)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Notification
                    </button>
                    <button
                      onClick={() =>
                        hanldeStatusChange(customer.id, customer.status === 'active' ? 'block' : 'active')
                      }
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      {customer.status === 'active' ? "Block User" : "Unblock User"}
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center p-4">
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

      {/* Modals */}
      {isNotificationModalOpen && (
        <NotificationHistoryModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          notifications={notifications}
          onNewNotification={handleNewNotificationClick}
        />
      )}
      {isNewNotificationModalOpen && (
        <NewNotificationModal
          actionType="add"
          isOpen={isNewNotificationModalOpen}
          onClose={() => setIsNewNotificationModalOpen(false)}
        // onSubmit={handleNewNotificationSubmit}
        />
      )}
    </div>
  );
};

export default CustomerTable;
