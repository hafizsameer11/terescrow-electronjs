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

          onClose={() => setIsGroupModalOpen(false)}
          onCreateGroup={handleCreateGroup}
        />
      )}
    </div>
  );
};

export default TeamChat;
