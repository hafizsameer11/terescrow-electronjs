import React, { useState } from "react";
import { MdOutlineDescription, MdChatBubbleOutline, MdEdit } from "react-icons/md";
import { MdEmail, MdLock, MdPhone, MdPerson, MdLocationOn } from "react-icons/md";
import { FaTicketAlt } from "react-icons/fa";
import ContactRow from "@renderer/components/ContactRow";
import KYCDetailsModal from "@renderer/components/modal/KYCDetailsModal";
import NotesHistoryModal from "@renderer/components/modal/NotesHistoryModal";
import EditProfileModal from "@renderer/components/modal/EditProfileModal";
import { Link, useNavigate, useParams } from "react-router-dom";

const DepartmentDetails: React.FC = () => {
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"details" | "transactions">(
    "details"
  );
  const kycData = {
    surname: "Adewale",
    firstName: "Susan",
    bvn: "234567890",
    dateOfBirth: "Feb 22, 1986",
    updateStatus: "Successful",
  };

  const customer = {
    id: 1,
    name: "Qamardeen Abdulmalik",
    username: "Alucard",
    email: "johndoe@gmail.com",
    mobileNumber: "+23481235848",
    password: "********",
    gender: "Male",
    referralCode: null,
    country: "Nigeria",
    kycStatus: "Successful",
    tier: "Tier 2",
    dateJoined: "Nov 7, 2024 - 04:30 PM",
    lastPasswordReset: "Nov 7, 2024 - 04:30 PM",
    accountActivities: [
      { label: "Date Joined", date: "Nov 7, 2024 - 04:30 PM" },
      { label: "Password Reset", date: "Nov 7, 2024 - 04:30 PM" },
    ],
  };

  const notes = [
    {
      id: 1,
      content: "Adecrypto Vendor - NGN1670/$1",
      date: "Nov 7, 2024 - 10:22 am",
      savedBy: "Alucard",
      isHighlighted: true,
    },
    {
      id: 2,
      content:
        "Customer is kind and reputable and respectful, does not like waiting for too long",
      date: "Nov 7, 2024 - 10:22 am",
      savedBy: "Dave",
    },
  ];

  const handleKYCUpdate = (status: string) => {
    console.log("Updated Status:", status);
    setIsKYCModalOpen(false);
  };

  const handleEditProfile = (updatedData: Record<string, string>) => {
    console.log("Updated Profile Data:", updatedData);
    setIsEditModalOpen(false);
  };

  const handleNewNote = () => {
    console.log("New Note");
  };

  const handleEditNote = (id: number) => {
    console.log("Edit Note", id);
  };

  const handleDeleteNote = (id: number) => {
    console.log("Delete Note", id);
  };
  const handleTabChange = (tab: "details" | "transactions") => {
    setActiveTab(tab);
    if (tab === "details") {
      navigate(`/customers/${customer.id}`);
    } else {
      navigate(`/transaction-details/${customer.id}`);
    }
  };
  return (
    <div className="min-h-screen w-full">
      {/* Tabs */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => handleTabChange("details")}
          className={`px-4 py-2 rounded-md shadow-sm ${activeTab === "details"
            ? "bg-[#147341] text-white"
            : "text-gray-700 border border-gray-200"
            }`}
        >
          Customer details and activities
        </button>
        <button
          onClick={() => handleTabChange("transactions")}
          className={`ml-4 px-4 py-2 rounded-md shadow-sm ${activeTab === "transactions"
            ? "bg-[#147341] text-white"
            : "text-gray-700 border border-gray-200"
            }`}
        >
          Transaction activities and balance
        </button>
      </div>

      {/* Profile Section */}
      <div className="bg-[#147341] text-white rounded-lg p-4 flex items-end justify-between mb-6">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-lg font-bold">
            {customer.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-bold mb-4">{customer.name}</h1>
            <p className="text-[16px] text-white">@{customer.username} - {customer.tier}</p>
            <div className="mt-2 flex items-center gap-2 bg-white text-[#147341] px-4 py-2 rounded-md">
              <span className="text-xs font-medium">KYC Status: {customer.kycStatus}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsKYCModalOpen(true)}
            className="bg-white text-[#00000080] rounded-lg p-2 shadow-md"
          >
            <MdOutlineDescription className="text-xl" />
          </button>
          <button
            onClick={() => setIsNotesModalOpen(true)}
            className="bg-white text-[#00000080] rounded-lg p-2 shadow-md"
          >
            <MdChatBubbleOutline className="text-xl" />
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="bg-white text-[#00000080] rounded-lg p-2 shadow-md"
          >
            <MdEdit className="text-xl" />
          </button>
        </div>
      </div>

      {/* Contact Details */}
      <div className="grid grid-cols-2 gap-8 bg-[#F9FAFF] p-6 rounded-lg shadow-md">
        <ContactRow icon={<MdEmail />} label="Email Address" value={customer.email} />
        <ContactRow icon={<MdPhone />} label="Mobile Number" value={customer.mobileNumber} />
        <ContactRow icon={<MdLock />} label="Password" value="••••••••••" />
        <ContactRow icon={<MdPerson />} label="Gender" value={customer.gender} />
        <ContactRow icon={<FaTicketAlt />} label="Referral Code" value={customer.referralCode} />
        <ContactRow icon={<MdLocationOn />} label="Country" value={customer.country} />
      </div>

      {/* Account Activities */}
      <div className="bg-white rounded-lg shadow-md mt-11">
        <h2 className="px-6 py-4 font-bold text-gray-700">Account Activities</h2>
        <table className="min-w-full text-left text-sm text-gray-600">
          <tbody>
            {customer.accountActivities.map((activity, index) => (
              <tr key={index} className="border-t">
                <td className="px-6 py-4 text-gray-800 font-semibold">{activity.label}</td>
                <td className="px-6 py-4 text-gray-800 font-semibold text-right">{activity.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <KYCDetailsModal
        isOpen={isKYCModalOpen}
        onClose={() => setIsKYCModalOpen(false)}
        kycData={kycData}
        onUpdate={handleKYCUpdate}
      />
      <NotesHistoryModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        notes={notes}
        onNewNote={handleNewNote}
        onEdit={handleEditNote}
        onDelete={handleDeleteNote}
      />
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={{
          fullName: customer.name,
          username: customer.username,
          email: customer.email,
          phoneNumber: customer.mobileNumber,
          gender: customer.gender,
          password: customer.password,
        }}

        // onUpdate={handleEditProfile}
        onUpdate={()=>{console.log("Updated Data:");}}
      />
    </div>
  );
};

export default DepartmentDetails;
