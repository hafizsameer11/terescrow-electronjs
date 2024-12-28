import React, { useState, useEffect, useRef } from 'react'
import ChatHeader from './ChatHeader'
import NotificationBanner from './NotificationBanner'
import NewTransaction from './NewTransaction'
import { AiOutlineSend, AiOutlinePicture } from 'react-icons/ai'; // Importing icons from react-icons
import { useQuery } from '@tanstack/react-query';
import { getAgentToCustomerChatDetails } from '@renderer/api/queries/admin.chat.queries';
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

const ChatApplication: React.FC<ChatApplicationProps> = ({ onClose, data, id, isAdmin }) => {
  console.log("The Id")
  console.log(id);
  console.log(data);
  const { name, username, serviceType } = data;
  const {token}=useAuth();
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

  const [inputValue, setInputValue] = useState('')
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [showBanner, setShowBanner] = useState(true)
  const [currentStatus, setCurrentStatus] = useState('Pending')
  const [notification, setNotification] = useState<{
    message: string
    backgroundColor: string
    textColor: string
    borderColor: string
  } | null>(null)


  const [isInputVisible, setIsInputVisible] = useState(true)
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
  }, [chatsData]);

  const handleImageUpload = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64Image = reader.result as string;
        const newMessage: Message = {
          id: messages.length + 1,
          text: '',
          type: 'sent',
          imageUrl: base64Image, // Use Base64 string
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]);
      };

      reader.readAsDataURL(file); // Convert file to Base64
    }
  };
  const sendMessage = () => {
    if (!inputValue.trim() && !uploadedImage) return

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputValue.trim(),
      type: 'sent'
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue('')

    // Simulate a dummy response
    setTimeout(() => {
      const dummyResponse: Message = {
        id: messages.length + 2,
        text: 'Got it! Let me check.',
        type: 'received'
      }
      setMessages((prev) => [...prev, dummyResponse])
    }, 1000)
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBanner(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])
  const handleSendMessage = () => {
    console.log("asdkl");
    if (!inputValue.trim()) return;
    setTimeout(() => {
      const dummyResponse: Message = {
        id: messages.length + 2,
        text: 'Got it! Let me check.',
        type: 'received'
      }
      setMessages((prev) => [...prev, dummyResponse])
    }, 1000)


    const newMessage: Message = {
      id: messages.length + 1,
      text: inputValue.trim(),
      type: 'sent',
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue('');
  };
  const handleStatusChange = (status: string, reason?: string) => {
    setIsInputVisible(false)

    if (status === 'Successful') {
      setNotification({
        message: 'This trade was completed by you.',
        backgroundColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300'
      })
      setCurrentStatus('Successful')
    } else if (status === 'Failed' && reason) {
      setNotification({
        message: `This trade was declined by you with reason "${reason}"`,
        backgroundColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-300'
      })
      setCurrentStatus('Failed')
    } else if (status === 'Unsuccessful') {
      setNotification({
        message: 'This trade was unsuccessful',
        backgroundColor: 'bg-pink-100',
        textColor: 'text-pink-800',
        borderColor: 'border-pink-300'
      })
      setCurrentStatus('Unsuccessful')
    }
    console.log("asjda");

  }

  const onSendRate = (rate: string, amountDollar: string, amountNaira: string) => {
    const rateMessage = `Rate ${rate} Amount - Dollar: ${amountDollar} Amount - Naira: ${amountNaira}`

    setMessages((prevMessages) => [
      ...prevMessages,
      { id: prevMessages.length + 1, text: rateMessage, type: 'sent' }
    ])
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full m-4 md:w-[35%] bg-white shadow-lg rounded-lg flex flex-col z-50">
      <ChatHeader
        avatar="https://via.placeholder.com/40"
        name={name}
        username={username}
        onClose={onClose}
        onSendRate={onSendRate}
        onLogChat={() => console.log('Log Chat')}
        onStatusChange={handleStatusChange}
      />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'} mb-2`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${message.type === 'sent' ? 'bg-green-100 text-gray-800' : 'bg-gray-100 text-gray-800'
                }`}
            >
              {message.imageUrl && (
                <img
                  src={message.imageUrl}
                  alt="Uploaded"
                  className="mb-2 rounded-lg w-full max-w-[150px]"
                />
              )}
              {message.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

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


      {/* Input Section */}
      {isInputVisible && (
        <div className="flex items-center p-4 border-t bg-white">
          {/* Image Upload Icon */}
          <label
            htmlFor="image-upload"
            className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 mr-4"
          >
            <AiOutlinePicture className="text-gray-500 w-6 h-6" />
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
            />
          </label>

          {/* Input Field */}
          <input
            type="text"
            placeholder="Type a message"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring focus:ring-gray-200"
          />

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            className="ml-4 px-4 py-2 text-green-700 hover:text-green-800 font-medium"
          >
            Send
          </button>
        </div>
      )}


      {/* NewTrans Modal */}
      {currentStatus === 'Successful' && <NewTransaction />}
    </div>
  )
}

export default ChatApplication
