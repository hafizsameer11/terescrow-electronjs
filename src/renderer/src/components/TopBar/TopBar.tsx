import React, { useState } from 'react'
import OnlineAgents from './OnlineAgents'
import UserProfile from './UserProfile'
import OnlineAgentsModal from '../OnlineAgentsModal'

const TopBar: React.FC = () => {
  const [modalVisibility, setModalVisibility] = useState(false)

  const handleToggleModal = () => {
    setModalVisibility(!modalVisibility)
  }
  return (
    <header className="flex justify-end items-center w-full bg-white px-8 py-2 border-b border-gray-200">
      {/* Online Agents */}
      <button onClick={handleToggleModal} className="flex items-center mr-[4rem]">
        {/* <span className="text-sm text-gray-600 mr-4 font-medium">Online Agents</span> */}
        <OnlineAgents />
      </button>
      {modalVisibility && <OnlineAgentsModal onCLose={handleToggleModal} />}

      {/* User Profile */}
      <UserProfile />
    </header>
  )
}

export default TopBar
