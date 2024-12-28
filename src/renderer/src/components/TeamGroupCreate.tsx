import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AiOutlineClose } from 'react-icons/ai';
import { AllAgentsResponse } from '@renderer/api/queries/datainterfaces';
import { getAllAgentss } from '@renderer/api/queries/adminqueries';
import { createChatGroup } from '@renderer/api/queries/admin.chat.mutation';
import { useAuth } from '@renderer/context/authContext';
// import { createChatGroup, getAllAgentss } from '@renderer/api/queries/adminQueries';
// import { AllAgentsResponse } from '@renderer/api/types';

interface TeamGroupCreateProps {
  onClose: () => void;
  onGroupCreated: () => void;
}

const TeamGroupCreate: React.FC<TeamGroupCreateProps> = ({ onClose, onGroupCreated }) => {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [groupName, setGroupName] = useState('');
  const queryClient = useQueryClient();
  const {token}=useAuth();
  // Fetch all agents
  const { data: allAgentsData, isLoading, isError } = useQuery<AllAgentsResponse>({
    queryKey: ['all-agents'],
    queryFn: () => getAllAgentss({ token }),
  });

  const agents = allAgentsData?.data || [];

  // Filter agents based on search
  const filteredAgents = agents.filter((agent) =>
    `${agent.user.firstname} ${agent.user.lastname}`
      .toLowerCase()
      .includes(searchValue.toLowerCase())
  );

  // Mutation for creating group
  const { mutate: createGroup,isPending: creatingGroup
   } = useMutation({
    mutationFn: (data: { groupName: string; participants: { id: number }[] }) =>
      createChatGroup({ data, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-chats-with-team']);
      onGroupCreated();
      onClose();
    },
    onError: (error) => {
      console.error('Error creating group:', error);
    },
  });

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      createGroup({
        groupName,
        participants: selectedUsers.map((id) => ({ id })),
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[90vw] max-w-md rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create New Group</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <AiOutlineClose className="w-6 h-6" />
          </button>
        </div>

        {/* Group Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Group Name</label>
          <input
            type="text"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
          />
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search team members"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
          />
        </div>

        {/* Agent List */}
        {isLoading ? (
          <div className="flex justify-center items-center">
            <p>Loading agents...</p>
          </div>
        ) : isError ? (
          <div className="text-red-500">Failed to load agents.</div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {filteredAgents.map((agent) => (
              <div
                key={agent.user.id}
                className="flex items-center justify-between py-2 px-4 hover:bg-gray-100 rounded-lg"
              >
                <div className="flex items-center">
                  <img
                    src={agent.user.profilePicture || '/default-avatar.png'}
                    alt={`${agent.user.firstname} ${agent.user.lastname}`}
                    className="w-10 h-10 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <div className="font-medium">
                      {agent.user.firstname} {agent.user.lastname}
                    </div>
                    <div className="text-sm text-gray-500">@{agent.user.username}</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(agent.id)}
                  onChange={() => toggleUserSelection(agent.id)}
                  className="w-5 h-5"
                />
              </div>
            ))}
          </div>
        )}

        {/* Create Button */}
        <button
          onClick={handleCreateGroup}
          disabled={creatingGroup || !groupName.trim() || selectedUsers.length === 0}
          className={`w-full mt-4 px-4 py-2 rounded-lg ${
            creatingGroup || !groupName.trim() || selectedUsers.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-700 text-white hover:bg-green-800'
          }`}
        >
          {creatingGroup ? 'Creating...' : 'Create Group'}
        </button>
      </div>
    </div>
  );
};

export default TeamGroupCreate;
