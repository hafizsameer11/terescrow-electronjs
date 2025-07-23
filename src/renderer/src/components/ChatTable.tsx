import React, { useState } from 'react'
// import ChatApplication from '../ChatApplication';
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai'
import TeamChat from './TeamChat'
import ChatApplication from './ChatApplication'
import { AgentToAgentChatData, AgentToCustomerChatData } from '@renderer/api/queries/datainterfaces'
import { getImageUrl } from '@renderer/api/helper'
import AdminChatApplication from './AdminChatApplication'
import AdminChatApplicationTeam from './AdminChatApplicationTeam'
import { useAuth } from '@renderer/context/authContext'
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
  data: AgentToCustomerChatData[] | undefined
  teamData?: AgentToAgentChatData[] | undefined
  isChat?: boolean
  isTeam?: boolean
  onEditHanlder?: (agentId: number) => void
  userViewState?: boolean
  onUserViewed: (selectedId: number) => void
  isTeamCommunition?: boolean
  activeFilterInTeam?: string
  // teamData: AgentToCustomerChatData[]
}

const ChatTable: React.FC<TransactionsTableProps> = ({
  data,
  teamData,
  isChat = false,
  isTeam = false,
  onEditHanlder,
  isTeamCommunition = true,
  onUserViewed,
  activeFilterInTeam = 'Customer'
}) => {
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const [activeChatId, setActiveChatId] = useState<number | null>(null); // Track the active chat ID
  const [currentItem, setCurrentItem] = useState<AgentToCustomerChatData | null>(null);
  const [currentItem2, setCurrentItem2] = useState<AgentToAgentChatData | null>(null);
  const { userData } = useAuth();
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data?.length ?? 0 / itemsPerPage);
  const paginatedData = data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (activeFilterInTeam === 'Customer') {
    return (
      <div className="mt-6 bg-white rounded-lg shadow-md">
        <table className="min-w-full table-fixed text-left text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="py-3 w-[5%]"></th> {/* First column with 5% width */}
              <th className="py-3 px-4 w-[20%]">Name, Chat</th>
              {/* {activeFilterInTeam === 'Customer' && <th className="py-3 px-4 w-[15%]">Id</th>} */}
              {activeFilterInTeam === 'Customer' && <th className="py-3 px-4 w-[15%]">Amount</th>}
              {activeFilterInTeam === 'Customer' && <th className="py-3 px-4 w-[15%]">Agent</th>}
              <th className="py-3 px-4 w-[20%]">Date</th>
              {activeFilterInTeam === 'Customer' && <th className="py-3 px-4 w-[15%]">Status</th>}
              <th className="py-3 px-4 text-center w-[10%]">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData?.map((item) => (
              // {console.log(item)}
              <tr key={item.id} className="border-t hover:bg-gray-50 relative">
                <td className="py-3 ps-5">
                  <div className="bg-gray- text-4xl rounded-full inline-flex mx-auto">
                    <img src={getImageUrl(item.customer.profilePicture)} alt="" />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <span className="font-semibold">{item.customer.username}</span>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 m-0">
                        {typeof item.recentMessage?.message === "string" && item.recentMessage.message.trim()
                          ? item.recentMessage.message.trim()
                          : "Sent an image"}
                      </p>

                      {item?.unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                          {item?.unreadCount}
                        </span>
                      )}

                    </div>





                  </div>
                </td>
                {/* <td className='py-3 px-4'>{item.id}</td> */}
                {activeFilterInTeam === 'Customer' && (
                  <td className="py-3 px-4">
                    <div>
                      <span className="block font-semibold">
                        {item?.transactions?.[0]?.amount ?? 0}
                      </span>
                      <span className="text-sm text-gray-500">₦   {item?.transactions?.[0]?.amountNaira ?? 0}</span>
                    </div>
                  </td>
                )}
                {activeFilterInTeam === 'Customer' && <td className="py-3 px-4">{item.agent.firstname} {item.agent.lastname}</td>}
                <td className="py-3 px-4">{item.recentMessage?.createdAt.split('T')[0]}</td>
                {activeFilterInTeam === 'Customer' && (
                  <td className="py-3 px-4">
                    <span
                      className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-lg border
    ${item.chatStatus === 'successful'
                          ? 'bg-green-100 text-green-700 border-green-500'
                          : item.chatStatus === 'declined'
                            ? 'bg-red-100 text-red-700 border-red-500'
                            : item.chatStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-500'
                              : item.chatStatus === 'unsucessful'
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
                                : item.chatStatus === 'unsucessful'
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
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => handleeyeclick(item.id, item)} // Pass the transaction ID here
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 3C7.5 3 3.75 7.03 2.25 12c1.5 4.97 5.25 9 9.75 9s8.25-4.03 9.75-9C20.25 7.03 16.5 3 12 3zM12 15a3 3 0 100-6 3 3 0 000 6z"
                        />
                      </svg>
                    </button>


                    {/* Drop down */}
                  </div>

                  {/* ChatApplication Component */}
                  {/* {isTeamCommunition &&
                    isChatOpen && ( */}
                  <div
                    className={` ${isTeamCommunition && isChatOpen ? '' : 'hidden'}`}>
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg relative overflow-visible">
                        {/* Close Button */}
                        <button
                          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                          onClick={() => setIsChatOpen(false)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>

                        {/* Check User Role and Render Appropriate Component */}
                        {userData?.role !== 'agent' ? (
                          currentItem ? (
                            <AdminChatApplication
                              data={currentItem}
                              id={activeChatId || 0}
                              onClose={() => setIsChatOpen(false)}
                              isAdmin={true}
                            />
                          ) : (
                            <div className="p-6 text-center">Loading chat data...</div>
                          )
                        ) : (
                          currentItem ? (
                            <ChatApplication
                              data={currentItem}
                              id={activeChatId || 0}
                              onClose={() => setIsChatOpen(false)}
                            />
                          ) : (
                            <div className="p-6 text-center">Loading chat data...</div>
                          )
                        )}

                      </div>
                    </div>
                  </div>

                  {/* )} */}
                  {/*
                  {activeMenu === item.id && (
                    <div
                      className="absolute right-10 mt-2 top-10 bg-[#F6F7FF] rounded-md w-48 z-50"
                      style={{
                        boxShadow: '0px 4px 6px #00000040' // Custom drop shadow
                      }}
                    >
                      <button
                        onClick={() => console.log('View Chat Details')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Delete Chat
                      </button>
                      <button
                        onClick={() => console.log('View Chat Details')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Role Chat
                      </button>
                    </div>
                  )} */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center p-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg text-sm ${currentPage === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg text-sm ${currentPage === totalPages
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  if (activeFilterInTeam === 'Team') {
    // Render Team Members Table
    return (
      <div className="mt-6 bg-white rounded-lg shadow-md">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="py-3 px-4">Name, Username</th>
              <th className="py-3 px-4">Recent Message</th>
              <th className="py-3 px-4">Date Added</th>
              {/* <th className="py-3 px-4">Role</th> */}
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {teamData?.map((member) => (
              <tr key={member.id} className="border-t hover:bg-gray-50">
                {/* Name and Username */}
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-gray-800">{member.otherParticipants[0].user.firstname}</span>
                      <p className="m-0 text-sm text-gray-500">{member.otherParticipants[0].user.username}</p>
                    </div>
                    <span
                      className={`w-3 h-3 rounded-full mb-4 ${member.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                    ></span>
                  </div>
                </td>
                <td className="py-3 px-4">{member?.recentMessage.message}</td>
                <td className="py-3 px-4">{member.recentMessageTimestamp.split('T')[0]}</td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center space-x-2">
                    <button
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      onClick={() =>
                        handlesecondEyeClick(member.id, member as AgentToAgentChatData)
                      }
                    >
                      <AiOutlineEye className="text-gray-700 w-5 h-5" />
                    </button>
                    <button
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      onClick={() => onEditHanlder && onEditHanlder(member.id)}
                    >
                      <AiOutlineEdit className="text-gray-700 w-5 h-5" />
                    </button>
                    <button
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      onClick={() => console.log('Delete', member.id)}
                    >
                      <AiOutlineDelete className="text-red-500 w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Chat Application */}
        {teamModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg relative">
              {/* Close Button */}
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setIsChatOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <AdminChatApplicationTeam
                data={currentItem2}
                id={activeChatId || 0}
                onClose={() => setTeamModal(false)}
                isAdmin={true}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

}

export default ChatTable
