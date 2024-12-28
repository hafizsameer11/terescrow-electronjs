import React, { useState, useEffect, useRef } from 'react'
import ChatHeader from './ChatHeader'
import NotificationBanner from './NotificationBanner'
import NewTransaction from './NewTransaction'
import { AiOutlineSend, AiOutlinePicture } from 'react-icons/ai'; // Importing icons from react-icons
import { useQuery } from '@tanstack/react-query';
import { getAgentToCustomerChatDetails } from '@renderer/api/queries/admin.chat.queries';
import AdminChatHeader from './AdminChatHeader';
import { getImageUrl } from '@renderer/api/helper';
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
  data?: any,
  isAdmin?: boolean
}

const AdminChatApplication: React.FC<ChatApplicationProps> = ({ onClose, data, id, isAdmin }) => {
  console.log("The Id")
  console.log(id);
  console.log(data);
  // const { , username, serviceType } = data;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'I want to trade $100.00 USA Amazon Credit receipt (25-49)',
      type: 'received'
    },
    {
      id: 2,
      text: 'Send details',
      type: 'sent'
    }
  ])
  const {token}=useAuth();
  const [dataa, setData] = useState<any>(data)
  const [currentStatus, setCurrentStatus] = useState('Pending')
  const [notification, setNotification] = useState<{
    message: string
    backgroundColor: string
    textColor: string
    borderColor: string
  } | null>(null)


  const chatEndRef = useRef<HTMLDivElement>(null)
  //get chat details
  const { data: chatsData, isLoading: chatLoading, isError: chatIsError, error: chatError } = useQuery({
    queryKey: ['chatDetails', id],
    queryFn: () => getAgentToCustomerChatDetails({ token, chatId: id.toString() }),
    enabled: !!token,
  });
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  useEffect(() => {
    console.log('Chat details:', chatsData?.data);
    setNotsification();
  }, [chatsData]);
  const setNotsification = () => {
    if (data.chatStatus === 'successful') {
      setNotification({
        message: 'This trade was completed ',
        backgroundColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300'
      })
      setCurrentStatus('Successful')
    } else if (data.chatStatus === 'declined') {
      setNotification({
        message: `This trade was declined `,
        backgroundColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-300'
      })
      setCurrentStatus('declined')
    } else if (data.chatStatus === 'pending') {
      setNotification({
        message: 'This trade was unsuccessful',
        backgroundColor: 'bg-pink-100',
        textColor: 'text-pink-800',
        borderColor: 'border-pink-300'
      })
      setCurrentStatus('pending')
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full m-4 md:w-[35%] bg-white shadow-lg rounded-lg flex flex-col z-50">
      <AdminChatHeader
        avatar="https://via.placeholder.com/40"
        name={data.customer.firstname}
        username={data.customer.username}
        onClose={onClose}

      />

      {/* Chat Messages */}
      {chatsData?.data &&

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatsData.data.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === data.agent.id ? 'justify-end' : 'justify-start'} mb-2`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${message.senderId === data.agent.id ? 'bg-green-100 text-gray-800' : 'bg-gray-100 text-gray-800'
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

export default AdminChatApplication
