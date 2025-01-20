import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AiOutlineClose } from 'react-icons/ai';
import { getAllUsers } from '@renderer/api/queries/adminqueries';
import { useAuth } from '@renderer/context/authContext';
import { getImageUrl } from '@renderer/api/helper';

interface CustomerListModalProps {
  onClose: () => void;
  onUsersSelected: (selectedUserIds: number[]) => void;
  role: 'customer' | 'agent';
}

const CustomerListModal: React.FC<CustomerListModalProps> = ({ onClose, onUsersSelected, role }) => {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const { token } = useAuth();

  // Fetch all users
  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ['userData'],
    queryFn: () => getAllUsers({ token }),
    enabled: !!token,
  });

  // Filter users based on search and role
  const filteredUsers = userData?.data.filter(
    (user) =>
      user.role === role &&
      `${user.firstname} ${user.lastname}`.toLowerCase().includes(searchValue.toLowerCase())
  );

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleConfirmSelection = () => {
    onUsersSelected(selectedUsers);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[90vw] max-w-md rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select {role === 'customer' ? 'Customers' : 'Agents'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <AiOutlineClose className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder={`Search ${role === 'customer' ? 'customers' : 'agents'}`}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
          />
        </div>

        {/* User List */}
        {isLoading ? (
          <div className="flex justify-center items-center">
            <p>Loading users...</p>
          </div>
        ) : isError ? (
          <div className="text-red-500">Failed to load users.</div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {filteredUsers?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between py-2 px-4 hover:bg-gray-100 rounded-lg"
              >
                <div className="flex items-center">
                  <img
                    src={getImageUrl(user.profilePicture)}
                    alt={`${user.firstname} ${user.lastname}`}
                    className="w-10 h-10 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <div className="font-medium">
                      {user.firstname} {user.lastname}
                    </div>
                    <div className="text-sm text-gray-500">@{user.username}</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => toggleUserSelection(user.id)}
                  className="w-5 h-5"
                />
              </div>
            ))}
          </div>
        )}

        {/* Confirm Button */}
        <button
          onClick={handleConfirmSelection}
          disabled={selectedUsers.length === 0}
          className={`w-full mt-4 px-4 py-2 rounded-lg ${selectedUsers.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-700 text-white hover:bg-green-800'
            }`}
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );
};

export default CustomerListModal;
