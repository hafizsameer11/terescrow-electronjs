import React, { useState, useEffect, useRef, ChangeEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { toastSuccess, toastError } from '@renderer/utils/toast';

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
  onUserViewed?: (customerId: number) => void;
}


const ChatApplication: React.FC<ChatApplicationProps> = ({ onClose, data, id, isAdmin, onUserViewed }) => {

  const { token, userData } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<IResMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedImageUrls, setSelectedImageUrls] = useState<Set<string>>(new Set());
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

  const openLightbox = (url: string) => {
    setLightboxUrl(url);
    setLightboxZoom(1);
  };

  const closeLightbox = () => {
    setLightboxUrl(null);
    setLightboxZoom(1);
  };

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImageUrls((prev) => {
      const next = new Set(prev);
      if (next.has(imageUrl)) next.delete(imageUrl);
      else next.add(imageUrl);
      return next;
    });
  };

  const handleImageClick = (e: React.MouseEvent, imageUrl: string) => {
    const multiSelect = selectMode || e.ctrlKey || e.metaKey;
    if (multiSelect) {
      e.preventDefault();
      toggleImageSelection(imageUrl);
      return;
    }
    openLightbox(imageUrl);
  };

  const clearImageSelection = () => {
    setSelectedImageUrls(new Set());
  };

  const copySelectedImages = async () => {
    const urls = Array.from(selectedImageUrls);
    if (urls.length === 0) return;
    try {
      const payloads = await Promise.all(
        urls.map(async (url) => {
          const res = await fetch(url);
          const arrayBuffer = await res.arrayBuffer();
          return { bytes: new Uint8Array(arrayBuffer) };
        })
      );
      const result = await window.electron.ipcRenderer.invoke(
        'copy-images-from-buffers',
        payloads
      );
      if (!result?.ok) {
        toastError('Failed to copy selected images');
        return;
      }
      toastSuccess(
        result.mode === 'files'
          ? `Copied ${result.count} images — paste with ⌘V / Ctrl+V (all files together)`
          : 'Image copied to clipboard'
      );
    } catch (err) {
      console.error('Failed to copy selected images:', err);
      toastError('Failed to copy selected images');
    }
  };

  const handleCustomerHeaderClick = () => {
    const customerId = data?.customer?.id;
    const q =
      data?.customer?.username ||
      [data?.customer?.firstname, data?.customer?.lastname].filter(Boolean).join(' ') ||
      '';
    onClose();
    if (customerId != null) onUserViewed?.(Number(customerId));
    if (q) navigate(`/chats?q=${encodeURIComponent(q)}`);
  };

  // Fetch chat details
  const { data: chatsData } = useQuery({
    queryKey: ['chatDetails', id],
    queryFn: () => getAgentToCustomerChatDetails({ token, chatId: id.toString() }),
    enabled: !!token,
    // refetchInterval: 1000,
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
      else if (chatsData?.data.chatDetails.status === 'pending') {
        // ✅ CLEAR old notification when chat is pending
        setNotification(null);
        setCurrentStatus('Pending');
        setIsInputVisible(true);
      }
    }
  }, [chatsData, id]);

  // Handle image upload and preview


  // Send a message (text and/or image)
  const sendMessage = () => {
    console.log("Uploaded Image", uploadedImage)
    if (!inputValue.trim() && !uploadedImage) return;
    console.log("Input Value", inputValue)
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
      console.log("download clicked", currentImageUrl);

      try {
        const res = await fetch(currentImageUrl);
        const arrayBuffer = await res.arrayBuffer();

        if (action === 'copy') {
          // window.electron.clipboard.writeImageFromArrayBuffer(arrayBuffer);
window.electron.ipcRenderer.send('copy-image-from-buffer', new Uint8Array(arrayBuffer));

        } else if (action === 'download') {
          const fileName = `image-${Date.now()}.jpg`;
          const downloadPath = `${window.electron.app.getDownloadsPath()}/${fileName}`;
          window.electron.fs.writeFileFromArrayBuffer(downloadPath, arrayBuffer);
          window.electron.shell.showItemInFolder(downloadPath);
        }
      } catch (error) {
        console.error('Context menu action failed:', error);
      }
    };

    const channel = 'context-menu-action';
    window.electron.ipcRenderer.removeListener(channel, handleContextMenuAction); // 🧹 CLEAN before add
    window.electron.ipcRenderer.on(channel, handleContextMenuAction);

    return () => {
      window.electron.ipcRenderer.removeListener(channel, handleContextMenuAction); // ✅ cleanup
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
          onUserViewed={handleCustomerHeaderClick}
        />

        <div className="px-4 py-2 border-b flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectMode((m) => {
                if (m) clearImageSelection();
                return !m;
              });
            }}
            className={`text-sm px-3 py-1 rounded-md border ${
              selectMode
                ? 'bg-green-700 text-white border-green-800'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {selectMode ? 'Done selecting' : 'Select'}
          </button>
          {selectMode && (
            <span className="text-xs text-gray-500">Click images to select, or Ctrl/Cmd+click anytime</span>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => {
            const text = typeof message.message === 'string' ? message.message.trim() : '';
            const imageUrl = message.image ? getImageUrl(message.image) : '';
            const isSelected = imageUrl ? selectedImageUrls.has(imageUrl) : false;
            return (
            <div
              key={message.id}
              className={`flex ${message.senderId === userData?.id ? 'justify-end' : 'justify-start'} mb-2`}
            >
              <div className="flex flex-col items-end space-y-1">
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${message.senderId === userData?.id
                    ? 'bg-green-100 text-gray-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {message.image && (
                    <div className="relative mb-2">
                      <img
                        src={imageUrl}
                        alt="Uploaded"
                        className={`rounded-lg w-full max-w-[150px] cursor-pointer ${
                          isSelected ? 'ring-2 ring-green-600 ring-offset-1' : ''
                        }`}
                        onClick={(e) => handleImageClick(e, imageUrl)}
                        onContextMenu={(e) => handleImageContextMenu(e, imageUrl)}
                      />
                      {(selectMode || isSelected) && (
                        <button
                          type="button"
                          aria-label={isSelected ? 'Deselect image' : 'Select image'}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleImageSelection(imageUrl);
                          }}
                          className={`absolute top-1 left-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'bg-green-600 border-green-700 text-white'
                              : 'bg-white/90 border-gray-400'
                          }`}
                        >
                          {isSelected ? '✓' : ''}
                        </button>
                      )}
                    </div>
                  )}
                  {text
                    ? text.split('\n').map((line, index) => (
                        <p key={index} className="whitespace-pre-wrap break-words">{line}</p>
                      ))
                    : message.image
                      ? <p className="text-sm text-gray-500 italic">Gift card image</p>
                      : <p className="text-sm text-gray-400 italic">(No message text)</p>}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true, // or false if you want 24-hour format
                  })}
                </span>
              </div>
            </div>
            );
          })}
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
              <textarea
                placeholder="Type a message"
                value={inputValue}
                onKeyDown={(e) => handleKeyDown(e)}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring focus:ring-gray-200"
                rows={1}
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
        {currentStatus === 'Successful' && (
          <>
            <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-sm text-amber-900">
              Log the sell, then check Pay customer to credit their wallet.
            </div>
            <NewTransaction
              type={chatsData?.data.chatDetails.department.niche}
              department={chatsData?.data.chatDetails.department}
              category={chatsData?.data.chatDetails.category}
              subcategories={['BTC']}
              chatId={id.toString()}
            />
          </>
        )}
      </div>

      {selectedImageUrls.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[180] flex items-center gap-3 px-4 py-2 rounded-lg shadow-lg bg-gray-900 text-white">
          <span className="text-sm">{selectedImageUrls.size} selected</span>
          <button
            type="button"
            onClick={copySelectedImages}
            className="text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700"
          >
            Copy {selectedImageUrls.size} image{selectedImageUrls.size === 1 ? '' : 's'}
          </button>
          <button
            type="button"
            onClick={clearImageSelection}
            className="text-sm px-3 py-1 rounded border border-gray-500 hover:bg-gray-800"
          >
            Clear
          </button>
        </div>
      )}

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-gray-200 focus:outline-none"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <IoClose className="w-8 h-8" />
          </button>
          <img
            src={lightboxUrl}
            alt="Full size"
            className="max-w-[90vw] max-h-[90vh] object-contain select-none transition-transform duration-150"
            style={{ transform: `scale(${lightboxZoom})` }}
            onClick={(e) => {
              e.stopPropagation();
              setLightboxZoom((z) => (z === 1 ? 1.75 : 1));
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ChatApplication;
