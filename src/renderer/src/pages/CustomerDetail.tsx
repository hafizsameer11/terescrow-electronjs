import React, { useEffect, useState } from "react";
import { MdOutlineDescription, MdChatBubbleOutline, MdEdit, MdLock, MdBlock } from "react-icons/md";
import { MdEmail, MdPhone, MdPerson, MdLocationOn } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import ContactRow from "@renderer/components/ContactRow";
import KYCDetailsModal from "@renderer/components/modal/KYCDetailsModal";
import NotesHistoryModal from "@renderer/components/modal/NotesHistoryModal";
import EditProfileModal from "@renderer/components/modal/EditProfileModal";

import { createNoteForCustomer, getCustomerDetails, getNotesForCustomer, updateKycStatus } from "@renderer/api/queries/adminqueries";
import { FaTicketAlt } from "react-icons/fa";
import { Customer, KycStateTwo } from "@renderer/api/queries/datainterfaces";
import { useAuth } from "@renderer/context/authContext";
import ChatNewNote from "@renderer/components/ChatNewNote";
import WalletModal, { type CryptoAsset } from "@renderer/components/modal/WalletModal";
import FreezeFeatureModal from "@renderer/components/modal/FreezeFeatureModal";
import FrozenFeaturesModal from "@renderer/components/modal/FrozenFeaturesModal";
import SuccessModal from "@renderer/components/modal/SuccessModal";
import ActivityTable from "@renderer/components/ActivityTable";
import { formatNairaAmount } from "@renderer/api/helper";
import { freezeCustomerFeature, unfreezeCustomerFeature } from "@renderer/api/admin/customers";
import { mapApiFeatureToLabel } from "@renderer/utils/freezeFeatures";
import { toastApiError, toastSuccess } from "@renderer/utils/toast";


const CustomerDetails: React.FC = () => {
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletWidgetTab, setWalletWidgetTab] = useState<'naira' | 'crypto'>('naira');
  const [isFrozenFeaturesModalOpen, setIsFrozenFeaturesModalOpen] = useState(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [frozenFeatures, setFrozenFeatures] = useState<string[]>([]);
  const [unfreezingFeature, setUnfreezingFeature] = useState<string | null>(null);
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<"details" | "transactions">("details");
  const [kycData, setKYCData] = useState<KycStateTwo>({} as KycStateTwo);
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
  const customerIp = (customer as any)?.ipAddress ?? '—';
  const customerTier = (customer as any)?.tier ?? 'Tier 1';
  const nairaBalanceRaw = (customer as any)?.nairaBalance ?? 0;
  const nairaBalance = `N${formatNairaAmount(nairaBalanceRaw)}`;
  const cryptoBalanceUsd = (customer as any)?.cryptoBalance ?? 0;
  const cryptoBalance = `$${Number(cryptoBalanceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const cryptoAssets: CryptoAsset[] = ((customer as any)?.cryptoAssets ?? []).map(
    (a: { symbol: string; name: string; balance: string; usdEquivalent: number }) => ({
      symbol: a.symbol,
      name: a.name,
      balance: a.balance,
      usdEquivalent: a.usdEquivalent,
    })
  );
  const {
    data: notDetailsData,
    isLoading: isNotesLoading,
  } = useQuery({
    queryKey: ['notes-for-customer'],
    queryFn: () => getNotesForCustomer(token, id!),
  });

  useEffect(() => {
    setKYCData(customer?.KycStateTwo || {} as KycStateTwo);
  }, [customer]);

  useEffect(() => {
    setFrozenFeatures(customer?.frozenFeatures ?? []);
  }, [customer]);

  const freezeMutation = useMutation({
    mutationFn: (feature: string) => freezeCustomerFeature(token!, id!, { feature }),
    onSuccess: (result) => {
      setFrozenFeatures(result.frozenFeatures ?? []);
      setIsFreezeModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['customerDetails', id] });
      queryClient.invalidateQueries({ queryKey: ['customersData'] });
      const msg = result.message || 'Feature frozen';
      setSuccessMessage(msg);
      toastSuccess(msg);
    },
    onError: (err) => toastApiError(err, 'Failed to freeze feature.'),
  });

  const unfreezeMutation = useMutation({
    mutationFn: (feature: string) => {
      setUnfreezingFeature(feature);
      return unfreezeCustomerFeature(token!, id!, { feature });
    },
    onSuccess: (result) => {
      setFrozenFeatures(result.frozenFeatures ?? []);
      setUnfreezingFeature(null);
      queryClient.invalidateQueries({ queryKey: ['customerDetails', id] });
      queryClient.invalidateQueries({ queryKey: ['customersData'] });
      const msg = result.message || 'Feature unfrozen';
      setSuccessMessage(msg);
      toastSuccess(msg);
    },
    onError: (err) => {
      setUnfreezingFeature(null);
      toastApiError(err, 'Failed to unfreeze feature.');
    },
  });
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
      data: { kycStatus: string, reason: string };
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
  const handleKYCUpdate = (kycStatus: string | undefined, reason?: string) => {
    if (!kycStatus) return;
    updateKyc({ data: { kycStatus, reason: reason ?? '' }, token, userId: id! });
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
      {/* Header: title left, IP + Wallet right */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Customer details</h1>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#147341] text-white">
            Ip Address: {customerIp}
          </span>
          <button
            type="button"
            onClick={() => setIsWalletModalOpen(true)}
            className="px-4 py-2 bg-[#147341] text-white font-medium rounded-lg hover:bg-[#0d5a2e]"
          >
            Wallet
          </button>
        </div>
      </div>

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
          Transaction activites and balance
        </button>
      </div>

      {/* Profile Section with wallet widget */}
      <div className="bg-[#147341] text-white rounded-lg p-4 flex items-stretch justify-between mb-6 gap-4">
        <div className="flex gap-4 flex-1">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-lg font-bold shrink-0">
            {customer?.firstname?.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-bold mb-1">
              {customer?.firstname} {customer?.lastname}
            </h1>
            <p className="text-[16px] text-white mb-2">
              @{customer?.username} - {customerTier}
            </p>
            <div className="inline-flex items-center gap-2 bg-white text-[#147341] px-4 py-2 rounded-md">
              <span className="text-xs font-medium">
                KYC status: {kycData?.state || "Not Verified"}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 min-w-[200px] flex flex-col">
          <div className="flex rounded border border-gray-200 overflow-hidden mb-3">
            <button
              type="button"
              onClick={() => setWalletWidgetTab('naira')}
              className={`flex-1 py-1.5 text-xs font-medium ${walletWidgetTab === 'naira' ? 'bg-[#147341] text-white' : 'text-gray-600'}`}
            >
              Naira Wallet
            </button>
            <button
              type="button"
              onClick={() => setWalletWidgetTab('crypto')}
              className={`flex-1 py-1.5 text-xs font-medium ${walletWidgetTab === 'crypto' ? 'bg-[#147341] text-white' : 'text-gray-600'}`}
            >
              Crypto Wallet
            </button>
          </div>
          <p className="text-lg font-bold text-gray-800 mb-3">
            {walletWidgetTab === 'naira' ? nairaBalance : cryptoBalance}
          </p>
          <div className="flex gap-2 mt-auto">
            {kycData.bvn && (
              <button
                onClick={() => setIsKYCModalOpen(true)}
                className="bg-gray-100 text-gray-700 rounded-lg p-2 hover:bg-gray-200"
                title="KYC document"
              >
                <MdOutlineDescription className="text-xl" />
              </button>
            )}
            <button
              onClick={() => setIsNotesModalOpen(true)}
              className="bg-gray-100 text-gray-700 rounded-lg p-2 hover:bg-gray-200"
              title="Notes"
            >
              <MdChatBubbleOutline className="text-xl" />
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-gray-100 text-gray-700 rounded-lg p-2 hover:bg-gray-200"
              title="Edit"
            >
              <MdEdit className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Frozen features */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Restricted features</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsFrozenFeaturesModalOpen(true)}
              className="px-4 py-2 text-sm font-medium border border-[#147341] text-[#147341] rounded-lg hover:bg-green-50"
            >
              View frozen features{frozenFeatures.length > 0 ? ` (${frozenFeatures.length})` : ''}
            </button>
            <button
              type="button"
              onClick={() => setIsFreezeModalOpen(true)}
              className="px-4 py-2 text-sm font-medium bg-[#147341] text-white rounded-lg hover:bg-[#0d5a2e]"
            >
              Freeze feature
            </button>
          </div>
        </div>
        {frozenFeatures.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {frozenFeatures.map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-red-50 text-red-800 border border-red-200"
              >
                <MdBlock className="shrink-0" />
                {mapApiFeatureToLabel(feature)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No features are frozen for this customer.</p>
        )}
      </div>

      {/* Contact Details */}
      <div className="grid grid-cols-2 gap-8 bg-[#F9FAFF] p-6 rounded-lg shadow-md mt-6">
        <ContactRow icon={<MdEmail />} label="Email Address" value={customer?.email || "N/A"} />
        <ContactRow icon={<MdPhone />} label="Mobile Number" value={customer?.phoneNumber || "N/A"} />
        <ContactRow icon={<MdLock />} label="Password" value="••••••••••" />
        <ContactRow icon={<MdPerson />} label="Gender" value={customer?.gender || "N/A"} />
        <ContactRow icon={<FaTicketAlt />} label="Referral Code" value={(customer as any)?.referralCode ?? 'none'} />
        <ContactRow icon={<MdLocationOn />} label="Country" value={customer?.country || "Nigeria"} />
      </div>
      <div className="mt-11 shadow-md rounded-lg overflow-hidden">
        <ActivityTable userId={id} itemsPerPage={6} />
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
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        nairaBalance={nairaBalance}
        cryptoBalance={cryptoBalance}
        cryptoAssets={cryptoAssets}
      />
      <FrozenFeaturesModal
        isOpen={isFrozenFeaturesModalOpen}
        onClose={() => setIsFrozenFeaturesModalOpen(false)}
        frozenFeatures={frozenFeatures}
        onUnfreeze={(feature) => unfreezeMutation.mutate(feature)}
        onFreezeAnother={() => {
          setIsFrozenFeaturesModalOpen(false);
          setIsFreezeModalOpen(true);
        }}
        unfreezingFeature={unfreezingFeature}
        isUnfreezing={unfreezeMutation.isPending}
      />
      {id && (
        <FreezeFeatureModal
          isOpen={isFreezeModalOpen}
          onClose={() => !freezeMutation.isPending && setIsFreezeModalOpen(false)}
          customerId={Number(id)}
          onProceed={(feature) => freezeMutation.mutate(feature)}
          isSubmitting={freezeMutation.isPending}
        />
      )}
      <SuccessModal
        isOpen={successMessage !== null}
        message={successMessage ?? ''}
        onClose={() => setSuccessMessage(null)}
      />
    </div>
  );
};

export default CustomerDetails;
