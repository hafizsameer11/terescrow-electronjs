import { KycStateTwo } from "@renderer/api/queries/datainterfaces";
import React, { useState, useEffect } from "react";
import { IoCopyOutline } from "react-icons/io5";

interface KYCDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  kycData: KycStateTwo;
  onUpdate: (status: string | undefined, reason?: string) => void;
}

const FieldRow: React.FC<{ label: string; value?: string | null; copyable?: boolean }> = ({
  label,
  value,
  copyable,
}) => {
  if (value == null || value === '') return null;
  return (
    <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4 gap-4">
      <span className="text-gray-600 shrink-0">{label}</span>
      <div className="flex items-center gap-2 text-right">
        <span className="text-[16px] font-normal break-all">{value}</span>
        {copyable && (
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(value)}
            className="text-gray-500 hover:text-gray-700 shrink-0"
          >
            <IoCopyOutline />
          </button>
        )}
      </div>
    </div>
  );
};

const KYCDetailsModal: React.FC<KYCDetailsProps> = ({ isOpen, onClose, kycData, onUpdate }) => {
  const [status, setStatus] = useState<string>(kycData.state || "pending");
  const [rejectionReason, setRejectionReason] = useState<string>(kycData.reason || "");

  useEffect(() => {
    if (kycData.state) setStatus(kycData.state);
    setRejectionReason(kycData.reason || "");
  }, [kycData.state, kycData.reason]);

  if (!isOpen) return null;

  const handleUpdate = () => {
    if (status === "failed" && rejectionReason.trim() === "") {
      alert("Please provide a reason for rejection.");
      return;
    }
    onUpdate(status, status === "failed" ? rejectionReason : undefined);
  };

  const tierLabel = kycData.tier ?? kycData.status ?? '—';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto py-10">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 text-center w-full">KYC Details</h2>
          <button type="button" onClick={onClose} className="text-gray-600 hover:text-gray-900 text-2xl">
            &times;
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg">
          <FieldRow label="Tier" value={String(tierLabel)} />
          <FieldRow label="Surname" value={kycData.surName} />
          <FieldRow label="First Name" value={kycData.firtName} />
          <FieldRow label="BVN" value={kycData.bvn} copyable />
          <FieldRow label="NIN" value={kycData.nin} copyable />
          <FieldRow label="Date of Birth" value={kycData.dob} />
          <FieldRow label="Country" value={kycData.country} />
          <FieldRow label="Address" value={kycData.address} />
          <FieldRow label="Document Type" value={kycData.documentType} />
          <FieldRow label="Document Number" value={kycData.documentNumber} copyable />
          <FieldRow label="ID Document" value={kycData.idDocumentUrl} />
          <FieldRow label="Proof of Address" value={kycData.proofOfAddressUrl} />
          <FieldRow label="Proof of Funds" value={kycData.proofOfFundsUrl} />
          <FieldRow label="Selfie" value={kycData.selfieUrl} />
        </div>

        <div className="flex flex-col py-1 pb-2 px-4 border border-[#000000CC] mt-3 rounded-lg">
          <span className="text-gray-600 text-[14px]">Update Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-2 bg-white text-[18px] font-normal appearance-none border-none outline-none"
          >
            <option value="verified">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {status === "failed" && (
          <div className="mt-3">
            <label className="text-gray-600 text-[14px]">Rejection Reason</label>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection"
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-[16px] font-normal mt-1"
            />
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={handleUpdate}
            className="w-full bg-[#147341] text-white rounded-lg px-4 py-2 font-semibold hover:bg-green-700"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYCDetailsModal;
