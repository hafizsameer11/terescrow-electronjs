import React, { useEffect, useState } from "react";
import { MdOutlineDescription, MdChatBubbleOutline, MdEdit, MdLock } from "react-icons/md";
import { MdEmail, MdPhone, MdPerson, MdLocationOn } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import ContactRow from "@renderer/components/ContactRow";
import KYCDetailsModal from "@renderer/components/modal/KYCDetailsModal";
import NotesHistoryModal from "@renderer/components/modal/NotesHistoryModal";
import EditProfileModal from "@renderer/components/modal/EditProfileModal";

import { createNoteForCustomer, getCustomerDetails, getNotesForCustomer, updateKycStatus } from "@renderer/api/queries/adminqueries";
import { FaTicketAlt } from "react-icons/fa";
import { AccountActivity, Customer, KycStateTwo } from "@renderer/api/queries/datainterfaces";
import { useAuth } from "@renderer/context/authContext";
import ChatNewNote from "@renderer/components/ChatNewNote";
// import { useQueryClient } from "react-query";


const CustomerDetails: React.FC = () => {
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<"details" | "transactions">("details");
  const [kycData, setKYCData] = useState<KycStateTwo>({} as KycStateTwo);
  const [accoutnActivity, setAccountActivity] = useState<AccountActivity[]>([]);
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate: addNote } = useMutation({
    mutationKey: ['add-note'],
    mutationFn: (data: {
      note: string,
      userId: number | string
    }) => createNoteForCustomer(data, token),
    onSuccess: () => {
      alert('Note added successfully')
      queryClient.invalidateQueries(['notes-for-customer'])
      // queryClient.invalidateQueries(['notes-for-customer', userId])
      // onclose()
      // onClose()
    },
    onError: (error) => {
      console.log(error)
      alert('Failed to add note')
    }

  })
  const onClose = () => {
    setIsModalOpen(false);
  }
  const handleAddNote = (newNote: string) => {
    addNote({
      note: newNote,
      userId: id!
    })
    // setAddNotes((prevNotes) => [...prevNotes, newNote]);

  };
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["customerDetails", id],
    queryFn: () => getCustomerDetails({ token, id: id! }),
    enabled: !!id,
  });
  const customer: Customer | undefined = data?.data;
  const {
    data: notDetailsData,
    isLoading: isNotesLoading,
  } = useQuery({
    queryKey: ['notes-for-customer'],
    queryFn: () => getNotesForCustomer(token, id!),
  });

  useEffect(() => {
    setKYCData(customer?.KycStateTwo || {} as KycStateTwo);
    setAccountActivity(customer?.AccountActivity || []);
  }, [customer])
  const handleTabChange = (tab: "details" | "transactions") => {
    setActiveTab(tab);
    navigate(tab === "details" ? `/customers/${id}` : `/transaction-details/${id}`);
  };
  const { mutate: updateKyc, isPending: isKYCUpdatePending } = useMutation({
    mutationKey: ['update-kyc-status'], // Unique mutation key
    mutationFn: async ({
      data,
      token,
      userId,
    }: {
      data: { kycStatus: string };
      token: string;
      userId: number | string;
    }) => {
      return await updateKycStatus(data, token, userId);
    },
    onSuccess: (data) => {
      // setKYCData(data);
      alert('KYC status updated successfully.');
    }, onError: (error) => {
      alert('Failed to update KYC status. Please try again.');
    }
  });
  const handleKYCUpdate = (status: string) => {
    console.log("Updated KYC Status:", status);
    // setIsKYCModalOpen(false);
    updateKyc({ data: { status }, token, userId: id! });
  };

  const handleEditProfile = (updatedData: Record<string, string>) => {
    console.log("Updated Profile Data:", updatedData);
    setIsEditModalOpen(false);
  };

  const handleNewNote = () => {
    // setIsNotesModalOpen(true);
    setIsModalOpen(true);
  };

  const handleEditNote = (noteId: number) => {
    console.log("Editing Note:", noteId);
  };

  const handleDeleteNote = (noteId: number) => {
    console.log("Deleting Note:", noteId);
  };

  if (isLoading) return <p>Loading customer details...</p>;
  if (isError) return <p>Error fetching customer details: {(error as any)?.message}</p>;


  //fetch all notes

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
          Customer Details and Activities
        </button>
        <button
          onClick={() => handleTabChange("transactions")}
          className={`ml-4 px-4 py-2 rounded-md shadow-sm ${activeTab === "transactions"
            ? "bg-[#147341] text-white"
            : "text-gray-700 border border-gray-200"
            }`}
        >
          Transaction Activities and Balance
        </button>
      </div>

      {/* Profile Section */}
      <div className="bg-[#147341] text-white rounded-lg p-4 flex items-end justify-between mb-6">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-lg font-bold">
            {customer?.firstname?.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-bold mb-4">
              {customer?.firstname} {customer?.lastname}
            </h1>
            <p className="text-[16px] text-white">
              @{customer?.username} - {customer?.role}
            </p>
            <div className="mt-2 flex items-center gap-2 bg-white text-[#147341] px-4 py-2 rounded-md">
              <span className="text-xs font-medium">
                KYC Status: {kycData?.state || "Not Verified"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {kycData.bvn &&
            <button
              onClick={() => setIsKYCModalOpen(true)}
              className="bg-white text-[#00000080] rounded-lg p-2 shadow-md"
            >
              <MdOutlineDescription className="text-xl" />
            </button>

          }
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
        <ContactRow icon={<MdEmail />} label="Email Address" value={customer?.email || "N/A"} />
        <ContactRow icon={<MdPhone />} label="Mobile Number" value={customer?.phoneNumber || "N/A"} />
        <ContactRow icon={<MdLock />} label="Password" value="••••••••••" />
        <ContactRow icon={<MdPerson />} label="Gender" value={customer?.gender || "N/A"} />
        <ContactRow icon={<FaTicketAlt />} label="Referral Code" value={"none"} />
        <ContactRow icon={<MdLocationOn />} label="Country" value={customer?.country || "Nigeria"} />
      </div>
      <div className="bg-white rounded-lg shadow-md mt-11">
        <h2 className="px-6 py-4 font-bold text-gray-700">Account Activities</h2>
        <table className="min-w-full text-left text-sm text-gray-600">
          <tbody>
            {accoutnActivity.map((activity, index) => (
              <tr key={index} className="border-t">
                <td className="px-6 py-4 text-gray-800 font-semibold">{activity.description}</td>
                <td className="px-6 py-4 text-gray-800 font-semibold text-right">{activity.createdAt.split("T")[0]}</td>
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
        notes={!isNotesLoading ? notDetailsData?.data : []}
        onNewNote={handleNewNote}
        onEdit={handleEditNote}
        onDelete={handleDeleteNote}
      />
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={{
          firstname: customer?.firstname || "",
          lastname: customer?.lastname || "",
          username: customer?.username || "",
          email: customer?.email || "",
          phoneNumber: customer?.phoneNumber || "",
          gender: customer?.gender || "",

          country: customer?.country || "",
          profilePhoto: customer?.profilePicture || "",
          id: customer?.id || "",
        }}
      />
      {isModalOpen && (
        <ChatNewNote
          onClose={() => setIsModalOpen(false)}
          onAddNote={handleAddNote}
        />
      )}
    </div>
  );
};

export default CustomerDetails;
