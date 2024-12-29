import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import ChatHeader from './ChatHeader';
import NotificationBanner from './NotificationBanner';
import NewTransaction from './NewTransaction';
import { AiOutlineSend, AiOutlinePicture } from 'react-icons/ai';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAgentToCustomerChatDetails } from '@renderer/api/queries/admin.chat.queries';
import { changeChatStatus, ChatStatus, sendMessageToCustomer } from '@renderer/api/queries/agent.mutations';
import { useAuth } from '@renderer/context/authContext';
import { getImageUrl } from '@renderer/api/helper';
import { ApiResponse } from '@renderer/api/queries/datainterfaces';
import { ApiError } from '@renderer/api/customApiCall';

export interface IResMessage {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  chatId: number;
  message: string;
  senderId: number;
  receiverId: number;
  isRead: boolean;
  image?: string;
}

interface ChatApplicationProps {
  onClose: () => void;
  data?: {
    customer?: {
      firstname?: string;
      username?: string;
      profilePicture?: string;
    };
  };
  id: number;
  isAdmin?: boolean;
}

const ChatApplication: React.FC<ChatApplicationProps> = ({ onClose, data, id, isAdmin }) => {
  const { token, userData } = useAuth();
  const [messages, setMessages] = useState<IResMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
  } | null>(null);
  const [currentStatus, setCurrentStatus] = useState('Pending');
  const [isInputVisible, setIsInputVisible] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat details
  const { data: chatsData } = useQuery({
    queryKey: ['chatDetails', id],
    queryFn: () => getAgentToCustomerChatDetails({ token, chatId: id.toString() }),
    enabled: !!token,
  });

  // Mutation for sending messages
  const { mutate: postMessage } = useMutation({
    mutationFn: (formData: FormData) => sendMessageToCustomer(formData, token),
    onSuccess: (response) => {
      const newMessage: IResMessage = {
        id: response.data.id,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
        chatId: response.data.chatId,
        message: response.data.message,
        senderId: userData?.id || 0,
        receiverId: response.data.receiverId,
        isRead: false,
        image: response.data.image,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      scrollToBottom();
    },
    onError: (error: any) => {
      alert(error.message);
    },
  });

  // Scroll to the bottom of the chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add chat messages to the state when fetched
  useEffect(() => {
    if (chatsData?.data?.messages) {
      setMessages(chatsData.data.messages);
      if(chatsData?.data.chatDetails.status=='successful'){
        setNotification({
          message: 'This trade was completed by you.',
          backgroundColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-300',
        });
        setIsInputVisible(false)
        // setCurrentStatus('Successful');
      }else if(chatsData?.data.chatDetails.status=='declined'){
        setNotification({
          message: `This trade was declined by you"`,
          backgroundColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300',
        });
        setCurrentStatus('Failed');
          setIsInputVisible(false)
      }
    }
  }, [chatsData]);

  // Handle image upload and preview


  // Send a message (text and/or image)
  const sendMessage = () => {
    if (!inputValue.trim() && !uploadedImage) return;

    const formData = new FormData();
    formData.append('chatId', id.toString());

    if (inputValue.trim()) {
      formData.append('message', inputValue);
    }

    if (uploadedImage) {
      formData.append('image', uploadedImage);
    }

    postMessage(formData);
    setInputValue('');
    setUploadedImage(null);
    setPreviewImage(null);
  };
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const uploadedImage = event.target.files?.[0];
    if (uploadedImage) {
      setUploadedImage(uploadedImage);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(uploadedImage);
    }
  }

  const { mutate: changeStatus, isPending: changeStatusPending } = useMutation({
    mutationFn: (data: { chatId: string; setStatus: ChatStatus }) =>
      changeChatStatus(data, token),
    mutationKey: ['change-chat-status'],
    onSuccess: (data: ApiResponse) => {
      alert(data.message)
    },
    onError: (error: ApiError) => {
      alert(error.message)
    },
  });
  const handleStatusChange = (status: string, reason?: string) => {
    setIsInputVisible(false)
    if (status === 'Successful') {
      setNotification({
        message: 'This trade was completed by you.',
        backgroundColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300',
      });
      setCurrentStatus('Successful');
    } else if (status === 'Failed' && reason) {
      changeChatStatus({ chatId: id.toString(), setStatus: ChatStatus.declined }, token)
      setNotification({
        message: `This trade was declined by you with reason "${reason}"`,
        backgroundColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-300',
      });
      setCurrentStatus('Failed');
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full m-4 md:w-[35%] bg-white shadow-lg rounded-lg flex flex-col z-50">
      <ChatHeader
        avatar={data?.customer?.profilePicture || 'https://via.placeholder.com/40'}
        name={data?.customer?.firstname}
        username={data?.customer?.username}
        onClose={onClose}
        onStatusChange={handleStatusChange}
        status={chatsData?.data?.chatDetails.status}
      />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === userData?.id ? 'justify-end' : 'justify-start'
              } mb-2`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${message.senderId === userData?.id
                ? 'bg-green-100 text-gray-800'
                : 'bg-gray-100 text-gray-800'
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

      {/* Notification Banner */}
      {notification && (
        <div className="px-4 py-2">
          <NotificationBanner
            message={notification.message}
            backgroundColor={notification.backgroundColor}
            textColor={notification.textColor}
            borderColor={notification.borderColor}
          />
        </div>
      )}

      {/* Input Section */}
      {isInputVisible && (
        <div className="flex flex-col p-4 border-t bg-white">
          {/* Image Preview */}
          {previewImage && (
            <div className="mb-4">
              <img
                src={previewImage}
                alt="Preview"
                className="rounded-lg max-w-[150px] mb-2"
              />
            </div>
          )}

          {/* Input and Buttons */}
          <div className="flex items-center">
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
                onChange={handleImageUpload}
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
              onClick={sendMessage}
              className="ml-4 px-4 py-2 text-green-700 hover:text-green-800 font-medium"
            >
              <AiOutlineSend />
            </button>
          </div>
        </div>
      )}

      {/* NewTrans Modal */}
      {currentStatus === 'Successful' && <NewTransaction type={chatsData?.data.chatDetails.department.niche} department={chatsData?.data.chatDetails.department} category={chatsData?.data.chatDetails.category} subcategories={["BTC"]} chatId={id.toString()}  />}
    </div>
  );
};

export default ChatApplication;
