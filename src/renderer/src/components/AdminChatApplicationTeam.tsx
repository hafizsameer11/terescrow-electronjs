import React, { useState, useEffect, useRef } from 'react'
import ChatHeader from './ChatHeader'
import NotificationBanner from './NotificationBanner'
import NewTransaction from './NewTransaction'
import { AiOutlineSend, AiOutlinePicture } from 'react-icons/ai'; // Importing icons from react-icons
import { useQuery } from '@tanstack/react-query';
import { getAgentToAgentChatDetails, getAgentToCustomerChatDetails } from '@renderer/api/queries/admin.chat.queries';
import AdminChatHeader from './AdminChatHeader';
import { getImageUrl } from '@renderer/api/helper';
import { AgentToAgentChatData } from '@renderer/api/queries/datainterfaces';
import { useAuth } from '@renderer/context/authContext';
interface Message {
  id: number
  text: string
  type: 'sent' | 'received'
  imageUrl?: string
}

interface ChatApplicationProps {
  onClose: () => void // Callback to close the chat
  id: number
  data?: AgentToAgentChatData,
  isAdmin?: boolean
}

const AdminChatApplicationTeam: React.FC<ChatApplicationProps> = ({ onClose, data, id, isAdmin }) => {
  console.log("The Id")
  console.log(id);
  console.log(data);
  const [dataa, setData] = useState<any>(data)
  const [currentStatus, setCurrentStatus] = useState('Pending')
  const {token}=useAuth();
  const [notification, setNotification] = useState<{
    message: string
    backgroundColor: string
    textColor: string
    borderColor: string
  } | null>(null)


  const chatEndRef = useRef<HTMLDivElement>(null)
  //get chat details
  const { data: chatsData, isLoading: chatLoading, isError: chatIsError, error: chatError } = useQuery({
    queryKey: ['agentToAgentChat', id],
    queryFn: () => getAgentToAgentChatDetails({ token, chatId: id.toString() }),
    enabled: !!token,
  });
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    console.log("Chat Data", chatsData,)
  }, [chatsData])


  return (
    <div className="fixed inset-y-0 right-0 w-full m-4 md:w-[35%] bg-white shadow-lg rounded-lg flex flex-col z-50">
      <AdminChatHeader
        avatar="https://via.placeholder.com/40"
        name={dataa?.otherParticipants[0].user.firstname}
        username={dataa?.otherParticipants[0].user.firstname}
        onClose={onClose}

      />

      {chatsData?.data &&

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatsData.data.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === chatsData.data.agent2.id ? 'justify-end' : 'justify-start'} mb-2`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${message.senderId === chatsData.data.agent2.id ? 'bg-green-100 text-gray-800' : 'bg-gray-100 text-gray-800'
                  }`}
              >
                {message.image && (
                  <img
                    src={getImageUrl(message.image)}
                    alt="Uploaded"
                    className="mb-2 rounded-lg w-full max-w-[150px]"
                  />
                )}
                {message.message}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

      }

      {/* Notification Banner */}
      {notification && (
        <div className="px-4 py-2">
          <NotificationBanner
            message={notification.message}
            backgroundColor={notification.backgroundColor}
            textColor={notification.textColor}
            borderColor={notification.borderColor}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
          />
        </div>
      )}





      {/* NewTrans Modal */}
      {/* {currentStatus === 'Successful' && <NewTransaction />} */}
    </div>
  )
}

export default AdminChatApplicationTeam
