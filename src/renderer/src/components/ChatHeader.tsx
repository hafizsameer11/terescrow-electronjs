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
  onSendRate: (rate: string, amountDollar: string, amountNaira: string) => void // Adjusted here
  onLogChat: () => void
  onStatusChange: (status: string, reason?: string) => void // Callback for status change
}

const ChatHeader: React.FC<HeaderProps> = ({
  avatar,
  name,
  username,
  onClose,
  onSendRate,
  onLogChat,
  onStatusChange
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string>('Pending')
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  const [isCustomRateModalOpen, setIsCustomRateModalOpen] = useState(false)

  const handleOptionClick = (option: string) => {
    setSelectedOption(option)
    setIsDropdownOpen(false)

    if (option === 'Successful') {
      setIsSuccessModalOpen(true) // Open success modal
    } else if (option === 'Failed') {
      setIsCancelModalOpen(true) // Open cancel modal
    } else {
      onStatusChange(option) // Directly update for options like "Pending" or "Unsuccessful"
    }
  }

  const handleConfirm = () => {
    onStatusChange('Successful')
    setIsSuccessModalOpen(false) // Close success modal after confirming
  }
  const handleRateModal = () => {
    // onSendRate();
    setIsCustomRateModalOpen(true)
  }
  const handleCancel = (reason: string) => {
    onStatusChange('Failed', reason)
    setIsCancelModalOpen(false) // Close cancel modal after submission
  }
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)

  const handleNotesIconClick = () => {
    setIsNoteModalOpen(true)
  }

  const handleCloseNoteModal = () => {
    setIsNoteModalOpen(false)
  }
  const notesData = [
    {
      id: 1,
      title: 'Adecrypto Vendor - NGN1670/$1',
      description: '',
      date: 'Nov 7, 2024 - 10:22 am',
      author: 'Alucard',
      pinned: true
    },
    {
      id: 2,
      title: '',
      description:
        'Customer is kind and reputable and respectful, doesnt stress me at all, but does not like waiting for too long',
      date: 'Nov 7, 2024 - 10:22 am',
      author: 'Dave',
      pinned: false
    },
    {
      id: 3,
      title: '',
      description:
        'Customer is kind and reputable and respectful, doesnt stress me at all, but does not like waiting for too long',
      date: 'Nov 7, 2024 - 10:22 am',
      author: 'Dave',
      pinned: false
    }
  ]
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
        <div className="flex items-center space-x-2">
          {/* Send Rate Button */}
          <button
            className="px-4 py-2 text-sm text-green-700 border border-green-700 rounded-lg hover:bg-green-50"
            onClick={handleRateModal}
          >
            Send Rate
          </button>
          {isCustomRateModalOpen && (
            <CustomRateModal
              onSendRate={onSendRate}
              onClose={() => setIsCustomRateModalOpen(false)}
            />
          )}

          {/* Log Chat Button */}
          <button
            className="px-4 py-2 text-sm text-white bg-green-700 rounded-lg hover:bg-green-800"
            onClick={onLogChat}
          >
            Log Chat
          </button>

          <div className="relative">
            {/* Notes Icon */}
            <button
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              onClick={handleNotesIconClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5 text-gray-700"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 11.25h6M7.5 14.25h3m3-10.5H7.5c-2.1 0-3 1.1-3 3v10.5c0 2.1 1.1 3 3 3h9c2.1 0 3-1.1 3-3v-9l-4.5-4.5z"
                />
              </svg>
            </button>

            {/* Modal */}
            {isNoteModalOpen && <ChatNoteModal notes={notesData} onClose={handleCloseNoteModal} />}
          </div>

          {/* Three Dots Menu */}
          <div className="relative inline-block">
            <button
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5 text-gray-700"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 4.5a.75.75 0 110-1.5.75.75 0 010 1.5zm0 4.5a.75.75 0 110-1.5.75.75 0 010 1.5z"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                <ul className="text-sm text-gray-700">
                  {['Successful', 'Pending', 'Failed', 'Unsuccessful'].map((option) => (
                    <li
                      key={option}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleOptionClick(option)}
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={selectedOption === option}
                        onChange={() => setSelectedOption(option)}
                        className="mr-2"
                      />
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isSuccessModalOpen && (
        <ChatConfirmModal onClose={() => setIsSuccessModalOpen(false)} onConfirm={handleConfirm} />
      )}
      {isCancelModalOpen && (
        <ChatCancelModal onClose={() => setIsCancelModalOpen(false)} onSubmit={handleCancel} />
      )}
    </>
  )
}

export default ChatHeader
