import React from 'react'
import { Icons } from '@renderer/constant/Icons'
import { useAuth } from '@renderer/context/authContext'
import { useQuery } from '@tanstack/react-query'
import { AllAgentsResponse } from '@renderer/api/queries/datainterfaces'
import { getAllAgentss } from '@renderer/api/queries/adminqueries'
import { getImageUrl } from '@renderer/api/helper'

interface Agent {
  name: string
  username: string
  avatar: string
}

const agents: Agent[] = [
  { name: 'Qamardeen Malik', username: '@Alucard', avatar: 'https://i.pravatar.cc/150?img=1' },
  { name: 'Sasha Sloan', username: '@Sasha', avatar: 'https://i.pravatar.cc/150?img=2' },
  { name: 'Adewale Faizah', username: '@Faizah', avatar: 'https://i.pravatar.cc/150?img=3' },
  { name: 'Karen Daisy', username: '@Karem', avatar: 'https://i.pravatar.cc/150?img=4' }
]
const OnlineAgentsModal: React.FC<{ onCLose: () => void }> = (props) => {
  const {token}=useAuth()
  const { data: allAgentsData, isLoading, isError } = useQuery<AllAgentsResponse>({
    queryKey: ['all-agents'],
    queryFn: () => getAllAgentss({ token }),
  });
  return (
    <div className="fixed inset-0 flex items-center justify-end bg-gray-500 bg-opacity-75 z-50">
      <div className="bg-white w-2/5 p-6 rounded-3xl shadow-xl absolute right-10 top-28">
        {/* Close Button */}
        <button onClick={props.onCLose} className="absolute top-5 right-10 text-xl text-gray-600">
          <img src={Icons.cross} alt="CLose Modal" />
        </button>
        {/* Modal Title */}
        <div className="text-2xl font-semibold text-gray-800 text-center mb-6">Online Agents</div>

        {/* Agents List */}
        <div>
          { !isLoading && allAgentsData?.data.map((agent) => (
            <div
              key={agent.user.id}
              className="flex items-center justify-between py-3 border border-gray-200 mb-4 rounded-lg p-5"
            >
              {/* Avatar */}
              <img src={getImageUrl(agent.user.profilePicture || "")} alt={agent.user.username} className="w-10 h-10 rounded-full" />
              <div className="ml-4 flex-1">
                <div className="font-semibold text-gray-800 mb-2">{agent.user.firstname}</div>
                <div className="text-sm text-gray-600">{agent.user.username}</div>
              </div>
              {/* Chat Button */}
              {/* <button className="px-3 py-1 text-sm font-medium text-gray-800 border border-gray-800 rounded-full">
                Chat
              </button> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OnlineAgentsModal
