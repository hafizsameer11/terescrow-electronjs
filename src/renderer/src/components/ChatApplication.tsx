import React, { useState, useEffect, useRef, ChangeEvent, useCallback } from 'react';
import ChatHeader from './ChatHeader';
import NotificationBanner from './NotificationBanner';
import NewTransaction from './NewTransaction';
import { AiOutlineSend, AiOutlinePicture, AiOutlineMessage } from 'react-icons/ai';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAgentToCustomerChatDetails } from '@renderer/api/queries/admin.chat.queries';
import { changeChatStatus, ChatStatus, sendMessageToCustomer } from '@renderer/api/queries/agent.mutations';
import { useAuth } from '@renderer/context/authContext';
import { getImageUrl } from '@renderer/api/helper';
import { AgentToCustomerChatData, ApiResponse } from '@renderer/api/queries/datainterfaces';
import { ApiError } from '@renderer/api/customApiCall';
import { IoClose } from 'react-icons/io5';
import { getAllQuickReplies } from '@renderer/api/queries/agent.queries';

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
  data?: AgentToCustomerChatData | null;
  id: number;
  isAdmin?: boolean;
}

const ChatApplication: React.FC<ChatApplicationProps> = ({ onClose, data, id, isAdmin }) => {
  const { token, userData } = useAuth();
  const [messages, setMessages] = useState<IResMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(false); // For toggling quick replies
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
    refetchInterval: 1000,
  });

  const { data: quickReplies } = useQuery({
    queryKey: ['quickReplies'],
    queryFn: () => getAllQuickReplies(token),
    enabled: !!token
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
      if (chatsData?.data.chatDetails.status == 'successful') {
        setNotification({
          message: 'This trade was completed by you.',
          backgroundColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-300',
        });
        setIsInputVisible(false)
        // setCurrentStatus('Successful');
      } else if (chatsData?.data.chatDetails.status == 'declined') {
        setNotification({
          message: `This Trade was declined. Reason : Invalid,unactivated or code has already been redeemed.`,
          backgroundColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300',
        });
        setCurrentStatus('Failed');
        setIsInputVisible(false)
      }
      else if (chatsData?.data.chatDetails.status == 'unsucessful') {
        setNotification({
          message: 'Abandoned Trade.',
          backgroundColor: 'bg-gray-100',
          textColor: 'text-gray-500',
          borderColor: 'border-gray-500',
        });

        setCurrentStatus('Failed');
        setIsInputVisible(false)
      }
    }
  }, [chatsData]);

  // Handle image upload and preview


  // Send a message (text and/or image)
  const sendMessage = () => {
    console.log("Uploaded Image", uploadedImage)
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewImage(event.target.result as string);
          console.log("previewImage", previewImage)
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
    setIsInputVisible(false);

    if (status === 'Successful') {
      changeChatStatus({ chatId: id.toString(), setStatus: ChatStatus.successful }, token);
      setNotification({
        message: 'This trade was completed by you.',
        backgroundColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300',
      });
      setCurrentStatus('Successful');
    } else if (status === 'Failed' && reason) {
      changeChatStatus({ chatId: id.toString(), setStatus: ChatStatus.declined }, token);
      setNotification({
        message: `This Trade was declined. Reason : ${reason}`,
        backgroundColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-300',
      });
      setCurrentStatus('Failed');
    } else if (status === 'unsucessful') {
      changeChatStatus({ chatId: id.toString(), setStatus: ChatStatus.unsuccessful }, token);
      setNotification({
        message: 'Abandoned Trade.',
        backgroundColor: 'bg-gray-100',
        textColor: 'text-gray-500',
        borderColor: 'border-gray-500',
      });

      setCurrentStatus('unsucessful');
    } else if (status === 'Pending') {
      changeChatStatus({ chatId: id.toString(), setStatus: ChatStatus.pending }, token);
      setNotification({
        message: 'This trade is now marked as pending. Reopen the chat.',
        backgroundColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-300',
      });
      setCurrentStatus('Pending');
    }
  };

  useEffect(() => {
    if (previewImage) {
      console.log("Preview Image", previewImage)
      setPreviewImage(previewImage)
      console.log("uploadedImage", uploadedImage)
      setUploadedImage(uploadedImage)
    }
  }, [previewImage])


  const handleQuickReplyClick = (message: string) => {
    setInputValue((prev) => (prev ? `${prev} ${message}` : message));
    setShowQuickReplies(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line on Enter key
      sendMessage();
    }
  };
  const currentImageUrlRef = useRef<string>('');


  const handleImageContextMenu = (e: React.MouseEvent, imageUrl: string) => {
    e.preventDefault();
    currentImageUrlRef.current = imageUrl;

    window.electron.ipcRenderer.send('show-image-context-menu');
  };
  useEffect(() => {
    const handleContextMenuAction = async (_event: any, action: string) => {
      const currentImageUrl = currentImageUrlRef.current;
      console.log("currentImageUrl", currentImageUrl);

      try {
        const res = await fetch(currentImageUrl);
        const arrayBuffer = await res.arrayBuffer();

        if (action === 'copy') {
          window.electron.clipboard.writeImageFromArrayBuffer(arrayBuffer);
        }

        if (action === 'download') {
          const fileName = `image-${Date.now()}.jpg`;
          const downloadPath = `${window.electron.app.getDownloadsPath()}/${fileName}`;
          window.electron.fs.writeFileFromArrayBuffer(downloadPath, arrayBuffer);
          window.electron.shell.showItemInFolder(downloadPath);
        }
      } catch (err) {
        console.error('Context menu action failed:', err);
      }
    };

    window.electron.ipcRenderer.on('context-menu-action', handleContextMenuAction);
    return () => {
      window.electron.ipcRenderer.removeListener('context-menu-action', handleContextMenuAction);
    };
  }, []);

  return (
    <div className='bg-black bg-opacity-30 w-full h-full  inset-0 flex items-center justify-center '>
      <div className="fixed inset-y-0 right-0 w-full m-4 md:w-[35%] bg-white shadow-lg rounded-lg flex flex-col ">
        <ChatHeader
          avatar={getImageUrl(data?.customer?.profilePicture) || 'https://via.placeholder.com/40'}
          name={`${data?.customer?.firstname} - ${data?.customer?.country}`}
          username={data?.customer?.username}
          onClose={onClose}
          onStatusChange={handleStatusChange}
          id={data?.customer?.id}
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
                    className="mb-2 rounded-lg w-full max-w-[150px] cursor-pointer"
                    onContextMenu={(e) => handleImageContextMenu(e, getImageUrl(message.image))}
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
          <div className="flex flex-col p-4 border-t bg-white relative">



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
              <button
                className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 mr-4"
                onClick={() => setShowQuickReplies((prev) => !prev)}
              >
                <AiOutlineMessage className="text-gray-500 w-6 h-6" />
              </button>

              {/* Input Field */}
              <input
                type="text"
                placeholder="Type a message"
                value={inputValue}
                onKeyDown={(e) => handleKeyDown(e)}
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


              {/* Quick Replies Modal/Dropdown */}
              {showQuickReplies && (
                <div className="absolute bottom-16 left-4 right-4 bg-white border border-gray-300 shadow-lg rounded-lg p-4 z-50">
                  <h4 className="text-lg font-bold mb-2">Quick Replies</h4>
                  <ul>
                    {quickReplies?.data?.map((reply, index) => (
                      <li
                        key={index}
                        className="py-2 px-3 hover:bg-gray-100 cursor-pointer rounded-lg"
                        onClick={() => handleQuickReplyClick(reply.message)}
                      >
                        {reply.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {previewImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          >
            <div className="relative bg-white w-[20%] h-ful rounded-lg shadow-lg flex flex-col items-center justify-center">
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 focus:outline-none"
                onClick={() => {
                  setUploadedImage(null);
                  setPreviewImage(null);
                }}
              >
                <IoClose className="w-8 h-8" />
              </button>


              {/* Image Preview */}
              <img
                src={previewImage}
                alt="Preview"
                className="w-auto h-auto max-h-[80%] max-w-[90%] rounded-lg"
              />

              {/* Send Button */}
              <button
                onClick={sendMessage}
                className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* NewTrans Modal */}
        {currentStatus === 'Successful' && <NewTransaction type={chatsData?.data.chatDetails.department.niche} department={chatsData?.data.chatDetails.department} category={chatsData?.data.chatDetails.category} subcategories={["BTC"]} chatId={id.toString()} />}
      </div>
    </div>
  );
};

export default ChatApplication;
