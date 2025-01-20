import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IoClose, IoImageOutline, IoSend } from 'react-icons/io5';
// import { ITeamChatDetailsResponse } from '@renderer/api/types';
import { getTeamChatDetails, markAllMessageread, readAllMessages, sendMessageToTeam } from '@renderer/api/queries/commonqueries';
import { ITeamChatDetailsResponse } from '@renderer/api/queries/datainterfaces';
import { getImageUrl } from '@renderer/api/helper';
import { useAuth } from '@renderer/context/authContext'
import { useSocket } from '@renderer/context/socketContext';
type TeamChatSectionProps = {
  chatId: number;
};

const TeamChatSection: React.FC<TeamChatSectionProps> = ({ chatId }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [messages, setMessages] = useState<ITeamChatDetailsResponse['data']['messages']>([]);
  const currParticipantsIds = useRef<number[]>([]);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const { token, userData } = useAuth()
  console.log("ChatId", chatId)
  // Fetch chat details
  const { data: chatDetailsData, refetch: refetchChatDetails, isError } = useQuery<ITeamChatDetailsResponse>({
    queryKey: ['team-chat-details', chatId],
    queryFn: () => getTeamChatDetails(token, chatId),
    refetchInterval: 1000, // Refetch every second
  });
  const { data: response } = useQuery({
    queryKey: ['markingAllRead', chatId],
    queryFn: () => markAllMessageread(token),
  })

  const { onlineAgents } = useSocket()
  // Update messages and participants on data change
  useEffect(() => {
    if (chatDetailsData?.data) {
      currParticipantsIds.current = chatDetailsData.data.participants.map(
        (participant) => participant.user.id
      );
      setMessages(chatDetailsData.data.messages);
    }
  }, [chatDetailsData]);

  // Send message mutation
  const { mutate: sendMessage } = useMutation({
    mutationFn: (formData: FormData) => sendMessageToTeam(formData, token),
    onSuccess: (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();
    },
  });

  // Mark messages as read
  const { mutate: readAll } = useMutation({
    mutationFn: () => readAllMessages({ chatId, token }),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-chats-with-team']);
    },
  });

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  // Handle sending messages
  const handleSendMessage = () => {
    if (!inputValue.trim() && !uploadedImage) return;

    const formData = new FormData();
    formData.append('chatId', chatId.toString());

    if (inputValue.trim()) {
      formData.append('message', inputValue);
    }

    if (uploadedImage) {
      formData.append('image', uploadedImage);
      setUploadedImage(null); // Clear the uploaded image after sending
    }
    setImagePreview(null); // Clear the image preview
    sendMessage(formData);

    setInputValue(''); // Clear the input field
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
          console.log("Image Preview", imagePreview)
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const handleCancelUpload = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="flex flex-col h-[90%]">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center">
          <img
            src={
              chatDetailsData?.data.chatGroup?.groupProfile
                ? getImageUrl(chatDetailsData?.data.chatGroup?.groupProfile)
                : getImageUrl(chatDetailsData?.data.participants?.[0]?.user?.profilePicture)

            }
            alt={chatDetailsData?.data.chatGroup?.groupName || 'Chat Avatar'}
            className="w-10 h-10 rounded-full mr-4"
          />
          <div>
            <div className="font-semibold text-gray-800">
              {chatDetailsData?.data.chatGroup?.groupName || chatDetailsData?.data.participants[0].user.username}
            </div>
          </div>
        </div>
      </div>
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {isError && <p className="text-red-500">Failed to load chat details.</p>}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === userData?.id ? 'justify-end' : 'justify-start'} mb-2`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${message.senderId === userData?.id
                ? 'bg-green-100 text-gray-800'
                : 'bg-gray-200 text-gray-800'
                }`}
            >
              {message.message}
              {message.isRead && (
                <span className="text-xs text-gray-500 ml-2">Read</span>
              )}
              {message.image && (
                <img
                  src={getImageUrl(message.image)}
                  alt="Uploaded"
                  className="mt-2 rounded-lg max-w-[150px]"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Field */}
      {/* if image preview exist than show it here */}
      {imagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded-lg max-w-sm w-full">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={handleCancelUpload}
            >
              <IoClose className="w-6 h-6" />
            </button>
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-auto rounded-lg mb-4"
              style={{ maxHeight: '300px' }}
            />
            <button
              onClick={handleSendMessage}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center p-4 border-t bg-white">
        {/* Image Upload */}
        <label
          htmlFor="image-upload"
          className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 mr-4"
        >
          <IoImageOutline className="w-6 h-6 text-gray-500" />
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        {/* Text Input */}
        <input
          type="text"
          placeholder="Type a message"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
        />

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          className="ml-4 px-4 py-2 text-white bg-green-700 rounded-lg hover:bg-green-800"
        >
          <IoSend className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default TeamChatSection;
