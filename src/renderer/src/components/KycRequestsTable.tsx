import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KYCDetailsModal from '@renderer/components/modal/KYCDetailsModal';
import { Customer, KycStateTwo } from '@renderer/api/queries/datainterfaces';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateKycStatus } from '@renderer/api/queries/adminqueries';
import { useAuth } from '@renderer/context/authContext';
import { toastApiError, toastSuccess } from '@renderer/utils/toast';

interface KycRequestsTableProps {
  data: Customer[];
}

const KycRequestsTable: React.FC<KycRequestsTableProps> = ({ data }) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [selectedKyc, setSelectedKyc] = useState<KycStateTwo | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { mutate: updateKyc, isPending } = useMutation({
    mutationFn: (payload: { kycStatus: string; reason?: string; userId: number }) =>
      updateKycStatus({ kycStatus: payload.kycStatus, reason: payload.reason }, token, payload.userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kycUsers'] });
      toastSuccess('KYC status updated');
      setModalOpen(false);
    },
    onError: (err) => toastApiError(err, 'Failed to update KYC status'),
  });

  const openKycModal = (customer: Customer) => {
    if (!customer.KycStateTwo) return;
    setSelectedKyc(customer.KycStateTwo);
    setSelectedUserId(customer.id);
    setModalOpen(true);
  };

  const handleKYCUpdate = (kycStatus: string | undefined, reason?: string) => {
    if (selectedUserId == null || !kycStatus) return;
    updateKyc({ kycStatus, reason, userId: selectedUserId });
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md">
      <table className="min-w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="py-3 px-4">Name</th>
            <th className="py-3 px-4">Email</th>
            <th className="py-3 px-4">Tier</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Submitted</th>
            <th className="py-3 px-1"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((customer) => (
            <tr key={customer.id} className="border-t hover:bg-gray-50">
              <td className="py-3 px-4 font-semibold">
                {customer.firstname} {customer.lastname}
                <span className="text-gray-500 font-normal"> ({customer.username})</span>
              </td>
              <td className="py-3 px-4">{customer.email}</td>
              <td className="py-3 px-4 capitalize">
                {customer.KycStateTwo?.tier ?? customer.KycStateTwo?.status ?? '—'}
              </td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 text-xs rounded-lg bg-yellow-100 text-yellow-800 capitalize">
                  {customer.KycStateTwo?.state ?? 'pending'}
                </span>
              </td>
              <td className="py-3 px-4">
                {customer.KycStateTwo?.createdAt
                  ? new Date(customer.KycStateTwo.createdAt as string).toLocaleDateString()
                  : customer.createdAt
                    ? new Date(customer.createdAt).toLocaleDateString()
                    : '—'}
              </td>
              <td className="py-3 px-4 text-right space-x-2">
                <button
                  type="button"
                  onClick={() => openKycModal(customer)}
                  className="text-sm text-[#147341] hover:underline"
                >
                  Review
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Profile
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedKyc && (
        <KYCDetailsModal
          isOpen={modalOpen}
          onClose={() => !isPending && setModalOpen(false)}
          kycData={selectedKyc}
          onUpdate={handleKYCUpdate}
        />
      )}
    </div>
  );
};

export default KycRequestsTable;
