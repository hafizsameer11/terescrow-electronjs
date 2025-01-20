import React, { useState } from 'react'
// import ChatApplication from '../ChatApplication';
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai'
import TeamChat from './TeamChat'
import ChatApplication from './ChatApplication'
import { Agent, Customer } from '@renderer/api/queries/datainterfaces'
import { getImageUrl } from '@renderer/api/helper'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '@renderer/context/socketContext'
// import TeamChat from '../TeamChat';

interface Transaction {
  id: number
  name: string
  username: string
  status: string
  serviceType?: string
  transactionType?: string
  date?: string
  amount?: string
  dateAdded?: string
  role?: string
}

interface TransactionsTableProps {
  data: Customer[]
  onEditHanlder?: (agentId: number) => void
  userViewState?: boolean
  onUserViewed: (selectedId: number) => void
}

const TeamTable: React.FC<TransactionsTableProps> = ({
  data,
  onEditHanlder,
  userViewState,
  onUserViewed
}) => {
  const [activeMenu, setActiveMenu] = useState<number | null>(null)

  const toggleMenu = (id: number) => {
    setActiveMenu(activeMenu === id ? null : id)
  }

  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isTeamChatOpen, setIsTeamChatOpen] = useState(false)

  const { onlineAgents } = useSocket()


  // Render Team Members Table
  return (
    <div className="mt-6 bg-white rounded-lg shadow-md">
      <table className="min-w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="py-3 px-4">Image, Name</th>
            <th className="py-3 px-4">Date Added</th>
            <th className="py-3 px-4">Role</th>
            <th className="py-3 px-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((member) => (
            <tr key={member.id} className="border-t hover:bg-gray-50">
              {/* Name and Username */}
              <td className="py-3 px-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0">
                    <img src={getImageUrl(member?.profilePicture || '') || ''} alt="" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">{member.firstname}</span>
                    <p className="m-0 text-sm text-gray-500">{member.username}</p>
                  </div>
                  <span
                    className={`w-3 h-3 rounded-full mb-4 ${onlineAgents.some((onlineAgent) => onlineAgent.userId == member?.id)
                        ? 'bg-green-500'
                        : 'bg-red-500'
                      }`}
                  ></span>

                </div>
              </td>

              {/* Date Added */}
              <td className="py-3 px-4">{member.createdAt.split('T')[0]}</td>

              {/* Role */}
              <td className="py-3 px-4">{member.role}</td>

              {/* Action */}
              <td className="py-3 px-4 text-center">
                <div className="flex justify-center space-x-2">
                  {/* View Button */}
                  <button
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    onClick={() => navigate(`/customers/${member.id}`)}
                  >
                    <AiOutlineEye className="text-gray-700 w-5 h-5" />
                  </button>

                  {/* Edit Button */}
                  <button
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    onClick={() => navigate(`/customers/${member.id}`)}
                  >
                    <AiOutlineEdit className="text-gray-700 w-5 h-5" />
                  </button>

                  {/* Delete Button */}
                  {/* <button
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    onClick={() => console.log('Delete', member.id)}
                  >
                    <AiOutlineDelete className="text-red-500 w-5 h-5" />
                  </button> */}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Chat Application */}
      {isTeamChatOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center z-50">
          <div className="bg-white ms-10 w-full max-w-3xl rounded-lg shadow-lg relative">
            <TeamChat onClose={() => setIsTeamChatOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )

}

export default TeamTable
