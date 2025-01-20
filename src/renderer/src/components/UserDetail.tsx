import { useAuth } from "@renderer/context/authContext"
import EditProfileModal from "./modal/EditProfileModal";
import { useState } from "react";
import ChangePasswordModal from "./modal/ChangePasswordModal";

const customer = {
  id: 1,
  name: 'Qamardeen Abdulmalik',
  username: 'Owner',
  email: 'johndoe@gmail.com',
  mobileNumber: '+23481235848',
  password: '********',
  gender: 'Male',
  referralCode: null,
  country: 'Nigeria',
  kycStatus: 'Successful',
  dateJoined: 'Nov 7, 2024 - 04:30 PM',
  lastPasswordReset: 'Nov 7, 2024 - 04:30 PM',
  accountActivities: [
    { label: 'Date Joined', date: 'Nov 7, 2024 - 04:30 PM' },
    { label: 'Create New Admin', date: 'Nov 7, 2024 - 04:30 PM' }
  ]
}

const UserDetail = () => {
  const { userData } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { token } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <>
      {/* Profile Section */}
      <div className="bg-[#147341] text-white rounded-lg p-4 flex justify-between mb-6">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-2xl font-bold">
            {customer.name.charAt(0)}
          </div>
          <div className="mt-2">
            <h1 className="text-lg font-bold mb-2">{userData?.firstname}</h1>
            <div className="text-sm text-white">{userData?.username}</div>
            <ul className="mt-3 flex items-center text-sm gap-8">
              <li className="flex items-center gap-1">
                <span className="font-medium me-5">Email:</span>
                <span className="text-white font-bold">{userData?.email}</span>
              </li>

              <li className="flex items-center gap-1">
                <span className="font-medium me-5">Date Added:</span>
                <span className="text-white font-bold">{customer.dateJoined}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className='flex items-end gap-3'>
          <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium" onClick={() => setIsEditModalOpen(true)}>
            Edit Profile
          </button>
          <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium mr-3" onClick={() => setIsPasswordModalOpen(true)}>
            Change Password
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md mt-11">
        <div className="px-6 py-4 font-semibold text-gray-900 ">Account Activities</div>
        <table className="min-w-full text-left text-sm text-gray-600">
          <tbody>
            {userData?.accountActivity?.map((activity, index) => (
              <tr key={index} className="border-t">
                <td className="px-6 py-4 text-gray-800 font-normal">{activity.description}</td>
                <td className="px-6 py-4 text-gray-800 font-normal text-right">{activity.createdAt.split('T')[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={{
          firstname: userData?.firstname || "",
          lastname: userData?.lastname || "",
          username: userData?.username || "",
          email: userData?.email || "",
          phoneNumber: userData?.phoneNumber || "",
          gender: userData?.gender || "",

          country: userData?.country || "",
          profilePhoto: userData?.profilePicture || "",
          id: userData?.id.toString() || "",
        }}
      />
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        token={token}
      />
    </>
  )
}

export default UserDetail
