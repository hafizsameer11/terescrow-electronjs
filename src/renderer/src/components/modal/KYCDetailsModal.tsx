import { KycStateTwo } from "@renderer/api/queries/datainterfaces";
import React, { useState, useEffect } from "react";
import { IoCopyOutline } from "react-icons/io5";

interface KYCDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  kycData: KycStateTwo;
  onUpdate: (status: string | undefined, reason?: string) => void;
}

const KYCDetailsModal: React.FC<KYCDetailsProps> = ({ isOpen, onClose, kycData, onUpdate }) => {
  // Initialize the status state, defaulting to "pending"
  const [status, setStatus] = useState<string>(kycData.state || "pending");
  const [rejectionReason, setRejectionReason] = useState<string>("");

  useEffect(() => {
    // Update status when kycData.state changes
    if (kycData.state) {
      setStatus(kycData.state);
    }
  }, [kycData.state]);

  if (!isOpen) return null;

  const handleUpdate = () => {
    if (status === "failed" && rejectionReason.trim() === "") {
      alert("Please provide a reason for rejection.");
      return;
    }

    onUpdate(status, status === "failed" ? rejectionReason : undefined);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[500px]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 text-center w-full">KYC Details</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-2xl">
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
            <span className="text-gray-600">Surname</span>
            <span className="text-[16px] font-normal text-right">{kycData.surName}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
            <span className="text-gray-600">First Name</span>
            <span className="text-[16px] font-normal text-right">{kycData.firtName}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
            <span className="text-gray-600">BVN</span>
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-normal">{kycData.bvn}</span>
              <button
                onClick={() => navigator.clipboard.writeText(kycData.bvn)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoCopyOutline />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
            <span className="text-gray-600">Date of Birth</span>
            <span className="text-[16px] font-normal text-right">{kycData.dob}</span>
          </div>
        </div>

        <div className="flex flex-col py-1 pb-2 px-4 border border-[#000000CC] mt-3 rounded-lg">
          <span className="text-gray-600 text-[14px]">Update Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-2 bg-white text-[18px] font-normal appearance-none border-none outline-none"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%23333\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z\' clip-rule=\'evenodd\'/%3E%3C/svg%3E")',
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
              backgroundSize: "1rem",
            }}
          >
            <option value="verified">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Conditional Input for Rejection Reason */}
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

        {/* Modal Footer */}
        <div className="mt-6">
          <button
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
