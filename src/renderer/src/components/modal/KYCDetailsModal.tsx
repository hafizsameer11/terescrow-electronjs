import React from "react";
import { IoCopyOutline } from "react-icons/io5";

interface KYCDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  kycData: {
    surname: string;
    firstName: string;
    bvn: string;
    dateOfBirth: string;
    updateStatus: string;
  };
  onUpdate: (status: string) => void;
}

const KYCDetailsModal: React.FC<KYCDetailsProps> = ({ isOpen, onClose, kycData, onUpdate }) => {
  const [status, setStatus] = React.useState(kycData.updateStatus);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[500px]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 ">
          <h2 className="text-xl font-semibold text-gray-800 text-center w-full">KYC Details</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-2xl">
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="border border-gray-200 rounded-lg">
          {/* Surname */}
          <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
            <span className="text-gray-600">Surname</span>
            <span className="text-[16px] font-normal text-right">{kycData.surname}</span>
          </div>
          {/* First Name */}
          <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
            <span className="text-gray-600">First Name</span>
            <span className="text-[16px] font-normal text-right">{kycData.firstName}</span>
          </div>
          {/* BVN */}
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
          {/* Date of Birth */}
          <div className="flex justify-between items-center border-b border-gray-200 py-3 px-4">
            <span className="text-gray-600">Date of Birth</span>
            <span className="text-[16px] font-normal text-right">{kycData.dateOfBirth}</span>
          </div>
          {/* Update Status */}
        </div>
          <div className="flex flex-col py-1 pb-2 px-4 border   border-[#000000CC] mt-3 rounded-lg">
            <span className="text-gray-600">Update Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 bg-white text-[20px] font-normal appearance-none border-none outline-none"

              style={{
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%23333\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z\' clip-rule=\'evenodd\'/%3E%3C/svg%3E")',
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "1rem",
              }}
            >
              <option   value="Successful">Successful</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

        {/* Modal Footer */}
        <div className="mt-6">
          <button
            onClick={() => onUpdate(status)}
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
