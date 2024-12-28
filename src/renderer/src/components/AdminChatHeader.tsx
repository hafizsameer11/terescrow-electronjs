import React, { useState } from 'react'
import CustomRateModal from './CustomRateModal'
import ChatNoteModal from './ChatNoteModal'
import ChatCancelModal from './ChatCancelModal'
import ChatConfirmModal from './ChatConfirmModal'
// import ChatConfirmModal from './ChatConfirmModal';
// import ChatCancelModal from './ChatCancelModal';
// import ChatNoteModal from './ChatNoteModal';
// import CustomRateModal from './CustomRateModal';

interface HeaderProps {
  avatar: string
  name: string
  username: string
  onClose: () => void

}

const AdminChatHeader: React.FC<HeaderProps> = ({
  avatar,
  name,
  username,
  onClose,

}) => {
  console.log("THis is the ChatHeader");
  console.log(name, username);

  return (
    <>
      <div className="flex items-center justify-between bg-gray-100 px-4 py-3 rounded-t-xl pt-6">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          {/* Close Button */}
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Avatar and Name */}
          <div>
            <img src={avatar} alt="User Avatar" className="w-10 h-10 rounded-full" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{name}</h3>
            <p className="text-sm text-gray-500 mb-0">@{username}</p>
          </div>
        </div>

        {/* Right Section */}

      </div>

  
    </>
  )
}

export default AdminChatHeader
