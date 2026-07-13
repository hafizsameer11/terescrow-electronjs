import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NewNotificationModal from "./modal/NewNotificationModal";
import NotificationHistoryModal from "./modal/NotificationHistoryModal";
import FreezeFeatureModal from "./modal/FreezeFeatureModal";
import SuccessModal from "./modal/SuccessModal";
import { Customer, InappNotification } from "@renderer/api/queries/datainterfaces";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chnageUserStatus } from "@renderer/api/queries/adminqueries";
import { freezeCustomerFeature, banCustomer } from "@renderer/api/admin/customers";
import { useAuth } from "@renderer/context/authContext";
import { parseCustomerId } from "@renderer/utils/freezeFeatures";
import { toastApiError, toastSuccess } from "@renderer/utils/toast";
import { useClientPagination } from "@renderer/utils/useClientPagination";

export interface CustomerTableServerPagination {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface CustomerTableProps {
  data: Customer[];
  serverPagination?: CustomerTableServerPagination;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ data, serverPagination }) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] =
    useState<boolean>(false);
  const [isNewNotificationModalOpen, setIsNewNotificationModalOpen] =
    useState<boolean>(false);
  const [notifications, setNotifications] = useState<InappNotification[]>([]);
  const [freezeModalCustomerId, setFreezeModalCustomerId] = useState<number | null>(null);
  const [freezeSuccessMessage, setFreezeSuccessMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const clientPagination = useClientPagination(data ?? [], 5, [data?.length]);
  const paginatedData = serverPagination ? data : clientPagination.paginatedData;
  const currentPage = serverPagination?.currentPage ?? clientPagination.currentPage;
  const totalPages = serverPagination?.totalPages ?? clientPagination.totalPages;
  const handlePageChange = serverPagination?.onPageChange ?? clientPagination.handlePageChange;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = (id: number) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const { mutate: mutation } = useMutation({
    mutationFn: (payload: { id: number, status: string }) =>
      chnageUserStatus({ id: payload.id.toString(), data: { status: payload.status }, token: token }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['customersData'] });
      toastSuccess(res.message || 'Status updated');
    },
    onError: (err) => toastApiError(err, 'Failed to change status.'),
  });

  const handleNewNotificationClick = () => {
    setIsNotificationModalOpen(false);
    setIsNewNotificationModalOpen(true);
  };

  const handleNotificationModalClick = (item: Customer) => {
    setNotifications(item?.inappNotification || []);
    setIsNotificationModalOpen(true);
  };

  const hanldeStatusChange = (id: number, status: string) => {
    mutation({ id, status });
  };

  const freezeMutation = useMutation({
    mutationFn: ({ customerId, feature }: { customerId: number; feature: string }) =>
      freezeCustomerFeature(token!, customerId, { feature }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['customersData'] });
      setFreezeModalCustomerId(null);
      const msg = result.message || 'Feature frozen successfully';
      setFreezeSuccessMessage(msg);
      toastSuccess(msg);
    },
    onError: (err) => toastApiError(err, 'Failed to freeze feature.'),
  });

  const banMutation = useMutation({
    mutationFn: ({ customerId, reason, permanent }: { customerId: number; reason?: string; permanent?: boolean }) =>
      banCustomer(token!, customerId, { reason, permanent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customersData'] });
      toastSuccess('Account banned');
    },
    onError: (err) => toastApiError(err, 'Failed to ban account.'),
  });

  const handleFreezeFeatureProceed = (feature: string) => {
    const customerId = parseCustomerId(freezeModalCustomerId);
    if (customerId == null) return;
    setActiveMenu(null);
    freezeMutation.mutate({ customerId, feature });
  };

  const handleFreezeModalClose = () => {
    if (!freezeMutation.isPending) {
      setFreezeModalCustomerId(null);
    }
  };

  const handleBanAccount = (customer: Customer) => {
    setActiveMenu(null);
    const permanent = window.confirm('Permanently ban this account? Cancel for temporary ban.');
    const reason = window.prompt('Reason for ban (optional):') ?? undefined;
    banMutation.mutate({ customerId: customer.id, reason, permanent });
  };

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
                      onClick={() => {
                        setFreezeModalCustomerId(customer.id);
                        setActiveMenu(null);
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Freeze feature
                    </button>
                    <button
                      onClick={() => handleBanAccount(customer)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Ban Account
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
        />
      )}
      {freezeModalCustomerId !== null && (
        <FreezeFeatureModal
          isOpen={true}
          onClose={handleFreezeModalClose}
          customerId={freezeModalCustomerId}
          onProceed={handleFreezeFeatureProceed}
          isSubmitting={freezeMutation.isPending}
        />
      )}
      <SuccessModal
        isOpen={freezeSuccessMessage !== null}
        message={freezeSuccessMessage ?? ''}
        onClose={() => setFreezeSuccessMessage(null)}
      />
    </div>
  );
};

export default CustomerTable;
