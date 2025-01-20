import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChatUser } from './TeamChat';
import { AiOutlineUsergroupAdd, AiOutlineEdit } from 'react-icons/ai';
import { getAllTeamChats } from '@renderer/api/queries/commonqueries';
import { getImageUrl } from '@renderer/api/helper';
import { useAuth } from '@renderer/context/authContext';
import { useSocket } from '@renderer/context/socketContext';

interface TeamChatSidebarProps {
  onSelectUser: (user: ChatUser) => void;
  onOpenGroupModal: () => void;
}

const TeamChatSidebar: React.FC<TeamChatSidebarProps> = ({
  onSelectUser,
  onOpenGroupModal,
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Group' | 'Unread'>('All');
  const [searchValue, setSearchValue] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<ChatUser[]>([]);
  const { token, userData } = useAuth();
  // Fetch chats using React Query
  const{onlineAgents} = useSocket()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['all-chats-with-team'],
    queryFn: () => getAllTeamChats(token),
    refetchInterval: 5000,
  });

  const chats = data?.data || [];

  // Transform chats to `ChatUser` format (useMemo ensures the transformation doesn't run on every render)
  const users: ChatUser[] = useMemo(() => {

    return chats.map((chat) => {
      const isGroup = chat.chatType === 'group_chat';
      const lastMessage = chat.messages[0] || null;
      const participants = chat.participants.filter(
        (p) => p.user.id !== userData?.id
      );
      const receiver = participants[0]?.user || null;

      return {
        id: chat.id,
        name: isGroup
          ? chat.chatGroup?.groupName || 'Unknown Group'
          : `${receiver?.firstname || ''} ${receiver?.lastname || ''}`.trim(),
        avatar: isGroup
          ? chat.chatGroup?.groupProfile || ''
          : receiver?.profilePicture || '',
        status: 'Online', // Replace with actual logic if available
        isGroup,
        groupMembers: isGroup ? chat.chatGroup?.groupName?.split(',') || [] : [],
        messages: chat.messages.map((msg) => ({
          id: msg.id,
          text: msg.message,
          type: msg.senderId === 3 ? 'sent' : 'received',
          timestamp: new Date(msg.createdAt).toLocaleTimeString(),
        })),
      };
    });
  }, [chats]);

  useEffect(() => {
    let filtered = [...users];

    // Filter by category
    if (activeTab === 'Group') {
      filtered = filtered.filter((user) => user.isGroup);
    } else if (activeTab === 'Unread') {
      filtered = filtered.filter((user) =>
        user.messages.some((msg) => msg.type === 'received') // Replace with actual unread logic
      );
    }

    // Filter by search term
    if (searchValue.trim()) {
      filtered = filtered.filter((user) =>
        user.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [activeTab, searchValue, users]);

  if (isLoading) return <div>Loading chats...</div>;
  if (isError) return <div>Error loading chats: {error?.message}</div>;

  return (
    <div className="flex flex-col h-full bg-white border-r shadow-sm">
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="font-bold text-lg">Chats</h2>
        {userData?.role === 'admin' && (

          <div className="flex space-x-2">
            <button
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              onClick={onOpenGroupModal}
            >
              <AiOutlineUsergroupAdd className="w-5 h-5 text-gray-700" />
            </button>
            {/* <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <AiOutlineEdit className="w-5 h-5 text-gray-700" />
          </button> */}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Search Chat"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring focus:ring-green-300 bg-gray-50 text-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 px-4 mb-4">
        {['All', 'Group', 'Unread'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full font-medium ${activeTab === tab ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700'
              } focus:outline-none`}
            onClick={() => setActiveTab(tab as 'All' | 'Group' | 'Unread')}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => onSelectUser(user)}
            className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer"
          >
            <img
              src={getImageUrl(user.avatar)}
              alt={user.name}
              className="w-12 h-12 rounded-full mr-4 object-cover"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-800">{user.name}</div>
              <div className="text-sm text-gray-500 truncate">
                {user.messages[0]?.text || 'No messages yet.'}
              </div>
            </div>
            <span
              className={`w-3 h-3 rounded-full ${onlineAgents.some((onlineAgent) => onlineAgent.userId == user?.id) ? 'bg-green-500' : 'bg-red-500'
                }`}
            ></span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamChatSidebar;
