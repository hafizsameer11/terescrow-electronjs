import React, { useState } from "react";
import { MdOutlineDescription, MdChatBubbleOutline, MdEdit } from "react-icons/md";
// import { AiOutlineCheckCircle } from "react-icons/ai";
// import { Colors } from "@renderer/constant/Colors";
import { Images } from "@renderer/constant/Image";
import { MdEmail, MdLock, MdPhone, MdPerson, MdLocationOn } from "react-icons/md";
import { FaTicketAlt } from "react-icons/fa";
import ContactRow from "@renderer/components/ContactRow";
// import { useParams } from 'react-router-dom';
import KYCDetailsModal from "@renderer/components/modal/KYCDetailsModal";

// interface CustomerDetailsProps {
//   customer: Customer;
// }

const CustomerDetails: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const { id } = useParams<{ id: string }>();

  const kycData = {
    surname: "Adewale",
    firstName: "Susan",
    bvn: "234567890",
    dateOfBirth: "Feb 22, 1986",
    updateStatus: "Successful",
  };
  const customer: Customer = {
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
  const handleUpdate = (status: string) => {
    console.log("Updated Status:", status);
    setIsModalOpen(false);
  };
  return (
    <div className=" min-h-screen  w-full">
      {/* Tabs */}
      <div className="flex  mb-6">
        <button className="bg-[#147341] text-[white] px-4 py-2 rounded-md shadow-sm">
          Customer details and activities
        </button>
        <button className="bg- text-gray-700 px-4 py-2 rounded-md shadow-sm border border-gray-200">
          Transaction activities and balance
        </button>
      </div>

      {/* Profile Section */}
      <div className="bg-[#147341] text-white rounded-lg p-4 flex items-end justify-between mb-6">
        <div className="flex  gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-lg font-bold">
            {customer.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-bold mb-4">{customer.name}</h1>
            <p className="text-[16px] text-[#FFFFFF]">@{customer.username} - {customer.tier}</p>
            <div className="mt-2 flex flex-col items-start  bg-white text-[#147341] text-xs px-[14px] py-[10px] mr-[20px] w-[60%] rounded-[10px] gap-1" >
              <div>
                <span className=" text-[10px] font-[400]">KYC status </span>
              </div>
              <div className="flex flex-ContactRow  bg-[#1473414D] rounded-[5px] border-[#147341] px-[6px] pr-[15px] py-[5px] gap-1">
                <img src={Images.tick} alt="" />

                <span className="text-[10px] text-[#147341]">Successful </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 items-end justify-end ">
          {/* Action Buttons */}
          <button className="bg-white text-[#00000080] rounded-[8px] p-2 shadow-md" onClick={() => setIsModalOpen(true)}>
            <MdOutlineDescription className="text-xl" />
          </button>
          <button className="bg-white text-[#00000080] rounded-[8px] p-2 shadow-md">
            <MdChatBubbleOutline className="text-xl" />
          </button>
          <button className="bg-white text-[#00000080] rounded-[8px] p-2 shadow-md">
            <MdEdit className="text-xl" />
          </button>
        </div>
      </div>
      {/* contact details */}
      <div className="grid grid-cols-2 gap-8 bg-[#F9FAFF] p-6 rounded-lg shadow-md">
        {/* Email Address */}
        <ContactRow
          icon={<MdEmail className="text-xl" />}
          label="Email Address"
          value={customer.email}
        />

        {/* Mobile Number */}
        <ContactRow
          icon={<MdPhone className="text-xl" />}
          label="Mobile Number"
          value={customer.mobileNumber}
        />

        {/* Password */}
        <ContactRow
          icon={<MdLock className="text-xl" />}
          label="Password"
          value="••••••••••"
        />

        {/* Gender */}
        <ContactRow
          icon={<MdPerson className="text-xl" />}
          label="Gender"
          value={customer.gender}
        />

        {/* Referral Code */}
        <ContactRow
          icon={<FaTicketAlt className="text-xl" />}
          label="Referral Code"
          value={customer.referralCode}
        />

        {/* Country */}
        <ContactRow
          icon={<MdLocationOn className="text-xl" />}
          label="Country"
          value={customer.country}
        />
      </div>

      {/* Account Activities Section */}
      <div className="bg-white rounded-lg shadow-md mt-11">
        <h2 className="px-6 py-4 font-bold text-gray-700">Account Activities</h2>
        <table className="min-w-full text-left text-sm text-gray-600">
          <tbody>
            {customer.accountActivities.map((activity, index) => (
              <tr key={index} className="border-t">
                <td className="px-6 py-4">{activity.label}</td>
                <td className="px-6 py-4 text-right">{activity.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <KYCDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        kycData={kycData}
        onUpdate={handleUpdate}
      />
    </div>

  );
};
//
export default CustomerDetails;

