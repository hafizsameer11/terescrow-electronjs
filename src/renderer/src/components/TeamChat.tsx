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
      avatar: 'https://avatars.githubusercontent.com/u/145552963?v=4',
      status: 'Online',
      messages: [
        { id: 1, text: 'Qamardeen: I need assistance with the report.', type: 'received', timestamp: '10:00 am' },
        { id: 2, text: 'Sure, I’ll help you out with it shortly.', type: 'sent', timestamp: '10:05 am' },
      ],
    },
    // Individual Chat: Alex Saltzman
    {
      id: 2,
      name: 'Alex Saltzman',
      avatar: 'https://avatars.githubusercontent.com/u/145552963?v=4',
      status: 'Online',
      messages: [
        { id: 1, text: 'Alex: Can you review the design I sent?', type: 'received', timestamp: '10:00 am' },
        { id: 2, text: 'Sure, I’ll take a look and provide feedback.', type: 'sent', timestamp: '10:10 am' },
      ],
    },
    // Group Chat: Buy Crypto Group
    {
      id: 8,
      name: 'Buy Crypto Group',
      avatar: 'https://avatars.githubusercontent.com/u/145552963?v=4',
      status: 'Online',
      isGroup: true,
      groupMembers: ['Qamardeen Malik', 'Alex Saltzman', 'Sasha Brandt'],
      messages: [
        { id: 1, text: 'Group: We need to confirm the payment deadlines.', type: 'received', timestamp: '9:00 am' },
        { id: 2, text: 'Sounds good, I’ll finalize the payment terms.', type: 'sent', timestamp: '9:15 am' },
        { id: 3, text: 'Let’s also discuss the delivery date.', type: 'received', timestamp: '9:20 am' },
      ],
    },
    // Group Chat: Marketing Team
    {
      id: 9,
      name: 'Marketing Team',
      avatar: 'https://avatars.githubusercontent.com/u/145552963?v=4',
      status: 'Online',
      isGroup: true,
      groupMembers: ['John Doe', 'Elena Gil', 'Fin Wade'],
      messages: [
        { id: 1, text: 'Group: Have we finalized the campaign visuals?', type: 'received', timestamp: '2:00 pm' },
        { id: 2, text: 'I’m almost done with the graphics, just need a final review.', type: 'sent', timestamp: '2:15 pm' },
        { id: 3, text: 'Let’s check everything before the launch tomorrow.', type: 'received', timestamp: '2:30 pm' },
      ],
    },
    // Group Chat: Support Team
    {
      id: 10,
      name: 'Support Team',
      avatar: 'https://avatars.githubusercontent.com/u/145552963?v=4',
      status: 'Offline',
      isGroup: true,
      groupMembers: ['Jane Smith', 'Buy Crypto Group', 'Marketing Team'],
      messages: [
        { id: 1, text: 'Group: The issue with the customer was resolved yesterday.', type: 'received', timestamp: '4:00 pm' },
        { id: 2, text: 'Perfect! Let’s close the ticket and mark it as resolved.', type: 'sent', timestamp: '4:05 pm' },
        { id: 3, text: 'I’ll make sure to follow up in the morning.', type: 'received', timestamp: '4:10 pm' },
      ],
    },
    {
      id: 11,
      name: 'Group',
      avatar: 'https://via.placeholder.com/50',
      status: 'Offline',
      isGroup: true,
      groupMembers: ['Jane Smith', 'Buy Crypto Group', 'Marketing Team'],
      messages: [
        { id: 1, text: 'Group: The issue with the customer was resolved yesterday.', type: 'received', timestamp: '4:00 pm' },
        { id: 2, text: 'Perfect! Let’s close the ticket and mark it as resolved.', type: 'received', timestamp: '4:05 pm' },
        { id: 3, text: 'Perfect! Let’s close the ticket and mark it as resolved.', type: 'received', timestamp: '4:05 pm' },
        { id: 4, text: 'Perfect! Let’s close the ticket and mark it as resolved.', type: 'sent', timestamp: '4:05 pm' },
      ],
    }
  ];


  const handleUserSelect = (user: ChatUser) => {
    setSelectedUser(user);
    console.log('Selected User:', user);
  };

  const handleCreateGroup = (selectedUsers: ChatUser[]) => {
    console.log('Group Created:', selectedUsers);
  };

  return (
    <div className="flex w-[90vw] h-[90vh] rounded-lg overflow-hidden shadow-md bg-white border">
      {/* Sidebar */}
      <div className="w-[35%] bg-gray-50 border-r">
        <TeamChatSidebar

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
          <TeamChatSection chatId={selectedUser.id} />
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
