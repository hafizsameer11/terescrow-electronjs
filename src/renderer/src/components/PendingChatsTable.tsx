import React, { useState } from 'react'
// import ChatApplication from '../ChatApplication';
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai'
import TeamChat from './TeamChat'
import ChatApplication from './ChatApplication'
import { AgentToAgentChatData, AgentToCustomerChatData, ApiResponse } from '@renderer/api/queries/datainterfaces'
import { getImageUrl } from '@renderer/api/helper'
import AdminChatApplication from './AdminChatApplication'
import AdminChatApplicationTeam from './AdminChatApplicationTeam'
import { useAuth } from '@renderer/context/authContext'
import { DefaultChatsData } from '@renderer/api/queries/agent.queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { overTakeChat } from '@renderer/api/queries/agent.mutations'
// import TeamChat from '../TeamChat';


interface TransactionsTableProps {
  data: DefaultChatsData[] | undefined

  isChat?: boolean
  isTeam?: boolean
  onEditHanlder?: (agentId: number) => void
  userViewState?: boolean
  onUserViewed: (selectedId: number) => void
  isTeamCommunition?: boolean
  activeFilterInTeam?: string
  // teamData: AgentToCustomerChatData[]
}

const PendingChatsTable: React.FC<TransactionsTableProps> = ({
  data,
  isTeamCommunition = true,
  activeFilterInTeam = 'Customer'
}) => {
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const [activeChatId, setActiveChatId] = useState<number | null>(null); // Track the active chat ID
  const [currentItem, setCurrentItem] = useState<AgentToCustomerChatData | null>(null);
  const [currentItem2, setCurrentItem2] = useState<AgentToAgentChatData | null>(null);
  const { userData } = useAuth();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const toggleMenu = (id: number) => {
    setActiveMenu(activeMenu === id ? null : id)
  }

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isTeamChatOpen, setIsTeamChatOpen] = useState(false)
  const [teamModal, setTeamModal] = useState(false)
  // const [teamchat, setTeamChat] = useState<AgentToAgentChatData | null>(null)
  const handleeyeclick = (id: number, item: AgentToCustomerChatData) => {
    console.log(id)
    setCurrentItem(item)
    setActiveChatId(id)
    setIsChatOpen(true)
  }
  const handlesecondEyeClick = (id: number, item: AgentToAgentChatData) => {
    setCurrentItem2(item)
    setTeamModal(true)
    setActiveChatId(id)
    setIsTeamChatOpen(true)
  }
  const { mutate: overTakeChatData, isPending: overtakeChatPending } = useMutation({
    mutationFn: (chatId: string) => overTakeChat(chatId, token),
    mutationKey: ['change-chat-status'],
    onSuccess: (data: ApiResponse) => {
      alert(data.message)
      // invalidate the query
      queryClient.invalidateQueries(['all-default-chats-with-customer']);
      //naviaget back


    },
    onError: (error: any) => {
      alert(error.message || 'Failed to change status')
    }
  })


  const handleOverTakeChat = (id: number) => {
    confirm('Are you sure you want to overtake this chat?') && overTakeChatData(id.toString())
  }
  if (activeFilterInTeam === 'Customer') {
    return (
      <div className="mt-6 bg-white rounded-lg shadow-md">
        <table className="min-w-full table-fixed text-left text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="py-3 w-[5%]"></th> {/* First column with 5% width */}
              <th className="py-3 px-4 w-[20%]">Name, Chat</th>
              <th className="py-3 px-4 w-[20%]">Department</th>

              <th className="py-3 px-4 w-[20%]">Date</th>
              {activeFilterInTeam === 'Customer' && <th className="py-3 px-4 w-[15%]">Status</th>}
              <th className="py-3 px-4 text-center w-[10%]">Action</th>
            </tr>
          </thead>

          <tbody>
            {data?.map((item) => (
              // {console.log(item)}
              <tr key={item.id} className="border-t hover:bg-gray-50 relative">
                <td className="py-3 ps-5">
                  <div className="bg-gray- text-4xl rounded-full inline-flex mx-auto">
                    <img src={getImageUrl(item.customer.profilePicture || "")} alt="" />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <span className="font-semibold">{item.customer.username}</span>
                    <p className="text-sm text-gray-500 m-0">{item.recentMessage?.message}</p>
                  </div>
                </td>

                <td className="py-3 px-4">{item.department.title}</td>
                <td className="py-3 px-4">{item.recentMessage?.createdAt.split('T')[0]}</td>
                {activeFilterInTeam === 'Customer' && (
                  <td className="py-3 px-4">
                    <span
                      className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-lg border w-[100px]
    ${item.chatStatus === 'successful'
                          ? 'bg-green-100 text-green-700 border-green-500'
                          : item.chatStatus === 'declined'
                            ? 'bg-red-100 text-red-700 border-red-500'
                            : item.chatStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-500'
                              : item.chatStatus === 'Unanswered'
                                ? 'bg-gray-100 text-gray-500 border-gray-500'
                                : 'bg-pink-100 text-pink-700 border-pink-500'
                        }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full
      ${item.chatStatus === 'successful'
                            ? 'bg-green-700'
                            : item.chatStatus === 'declined'
                              ? 'bg-red-700'
                              : item.chatStatus === 'pending'
                                ? 'bg-yellow-700'
                                : item.chatStatus === 'Unanswered'
                                  ? 'bg-gray-700'
                                  : 'bg-pink-700'
                          }`}
                      ></span>
                      {item.chatStatus}
                    </span>
                  </td>
                )}
                <td className="py-3 px-4 relative">
                  <div className="flex justify-center items-center space-x-5">
                    {/* Button to Open Chat */}
                    <button
                      className="text-gray-500 text-[11px] hover:text-gray-700 focus:outline-none bg-[#F0F0F0] hover:bg-gray-200 p-2 rounded-md"
                      onClick={() => handleOverTakeChat(item.id)}

                    >
                      Take Over Chat
                    </button>


                  </div>


                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }



}

export default PendingChatsTable
