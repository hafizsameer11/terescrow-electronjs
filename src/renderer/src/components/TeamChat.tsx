import React, { useState } from 'react';
import TeamChatSidebar from './TeamChatSidebar';
import TeamChatSection from './TeamChatSection';
import TeamGroupCreate from './TeamGroupCreate';
import { IoCloseOutline } from 'react-icons/io5';


export interface ChatUser {
  id: number;
  name: string;
  avatar: string; // User avatar
  status: 'Online' | 'Offline';
  messages: ChatMessage[];
  isGroup?: boolean;
  groupMembers?: string[];
}

export interface ChatMessage {
  id: number;
  text: string;
  type: 'sent' | 'received';
  timestamp: string;
  imageUrl?: string; // Optional field for image messages

}
interface TeamChatProps {
  onClose: () => void
}

const TeamChat: React.FC<TeamChatProps> = ({ onClose }) => {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const users: ChatUser[] = [
    // Individual Chat: Qamardeen Malik
    {
      id: 1,
      name: 'Qamardeen alis',
      avatar: 'https://via.placeholder.com/50',
      status: 'Online',
      messages: [
        { id: 1, text: 'Dave: I have attended to the user', type: 'received', timestamp: '10:00 am' },
        { id: 2, text: 'Sure, let me know if you need anything.', type: 'sent', timestamp: '10:05 am' },
      ],
    },
    // Individual Chat: Alex Saltzman
    {
      id: 2,
      name: 'Alex Saltzman',
      avatar: 'https://via.placeholder.com/50',
      status: 'Online',
      messages: [
        { id: 1, text: 'Dave: I have attended to the user', type: 'received', timestamp: '10:00 am' },
      ],
    },
    // Individual Chat: Sasha Brandt
    {
      id: 3,
      name: 'Sasha Brandt',
      avatar: 'https://via.placeholder.com/50',
      status: 'Offline',
      messages: [
        { id: 1, text: 'No messages yet.', type: 'received', timestamp: '10:00 am' },
      ],
    },
    // Individual Chat: John Doe
    {
      id: 4,
      name: 'John Doe',
      avatar: 'https://via.placeholder.com/50',
      status: 'Online',
      messages: [
        { id: 1, text: 'Can we schedule a meeting for later today?', type: 'sent', timestamp: '9:30 am' },
        { id: 2, text: 'Sure, let me check my availability.', type: 'received', timestamp: '9:35 am' },
      ],
    },
    // Individual Chat: Elena Gil
    {
      id: 5,
      name: 'Elena Gil',
      avatar: 'https://via.placeholder.com/50',
      status: 'Online',
      messages: [
        { id: 1, text: 'Please review the latest document.', type: 'sent', timestamp: '11:00 am' },
        { id: 2, text: 'Got it, will get back to you shortly.', type: 'received', timestamp: '11:05 am' },
      ],
    },
    // Individual Chat: Fin Wade
    {
      id: 6,
      name: 'Fin Wade',
      avatar: 'https://via.placeholder.com/50',
      status: 'Offline',
      messages: [
        { id: 1, text: 'I’ll be out of the office today.', type: 'sent', timestamp: '8:00 am' },
        { id: 2, text: 'Alright, let me know if anything comes up.', type: 'received', timestamp: '8:15 am' },
      ],
    },
    // Individual Chat: Jane Smith
    {
      id: 7,
      name: 'Jane Smith',
      avatar: 'https://via.placeholder.com/50',
      status: 'Online',
      messages: [
        { id: 1, text: 'Could you send me the project updates?', type: 'sent', timestamp: '12:00 pm' },
        { id: 2, text: 'Yes, I’ll send them over in 10 minutes.', type: 'received', timestamp: '12:05 pm' },
      ],
    },
    // Group Chat: Buy Crypto Group
    {
      id: 8,
      name: 'Buy Crypto Group',
      avatar: 'https://via.placeholder.com/50',
      status: 'Online',
      isGroup: true,
      groupMembers: ['Qamardeen Malik', 'Alex Saltzman', 'Sasha Brandt'],
      messages: [
        { id: 1, text: 'Group: Let’s finalize the payment options.', type: 'received', timestamp: '9:00 am' },
        { id: 2, text: 'Sounds good, I’ll draft a plan.', type: 'sent', timestamp: '9:15 am' },
        { id: 3, text: 'Make sure we double-check the wallet addresses.', type: 'received', timestamp: '9:20 am' },
      ],
    },
    // Group Chat: Marketing Team
    {
      id: 9,
      name: 'Marketing Team',
      avatar: 'https://via.placeholder.com/50',
      status: 'Online',
      isGroup: true,
      groupMembers: ['John Doe', 'Elena Gil', 'Fin Wade'],
      messages: [
        { id: 1, text: 'Group: The campaign launch is tomorrow!', type: 'received', timestamp: '2:00 pm' },
        { id: 2, text: 'Great, I’ll finalize the visuals.', type: 'sent', timestamp: '2:15 pm' },
        { id: 3, text: 'Let’s review it together at 4 PM.', type: 'received', timestamp: '2:30 pm' },
      ],
    },
    // Group Chat: Support Team
    {
      id: 10,
      name: 'Support Team',
      avatar: 'https://via.placeholder.com/50',
      status: 'Offline',
      isGroup: true,
      groupMembers: ['Jane Smith', 'Buy Crypto Group', 'Marketing Team'],
      messages: [
        { id: 1, text: 'Group: The client issue has been resolved.', type: 'received', timestamp: '4:00 pm' },
        { id: 2, text: 'Excellent, let’s update the ticket.', type: 'sent', timestamp: '4:05 pm' },
        { id: 3, text: 'We should also follow up with them tomorrow.', type: 'received', timestamp: '4:10 pm' },
      ],
    },
  ];


  const handleUserSelect = (user: ChatUser) => {
    setSelectedUser(user);
  };

  const handleCreateGroup = (selectedUsers: ChatUser[]) => {
    console.log('Group Created:', selectedUsers);
  };

  return (
    <div className="flex w-[90vw] h-[90vh] rounded-lg overflow-hidden shadow-md bg-white border">
      {/* Sidebar */}
      <div className="w-[35%] bg-gray-50 border-r">
        <TeamChatSidebar
          users={users}
          onSelectUser={handleUserSelect}
          onOpenGroupModal={() => setIsGroupModalOpen(true)}
        />
      </div>

      {/* Chat Section */}
      <div className="flex-1">
        {/* Close Button */}
        <div className='flex justify-end items-end'>
          <button
            className="mt-5 me-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={onClose}
          >
            <IoCloseOutline className="w-6 h-6" />
          </button>
        </div>
        {selectedUser ? (
          <TeamChatSection user={selectedUser} />
        ) : (
          <div className="flex justify-center items-center h-full text-gray-400 text-lg">
            Select a user to start chatting.
          </div>
        )}
      </div>

      {/* Group Modal */}
      {isGroupModalOpen && (
        <TeamGroupCreate
          users={users}
          onClose={() => setIsGroupModalOpen(false)}
          onCreateGroup={handleCreateGroup}
        />
      )}
    </div>
  );
};

export default TeamChat;
