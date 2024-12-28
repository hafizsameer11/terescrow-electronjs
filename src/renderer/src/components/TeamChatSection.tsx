import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client'; // Install socket.io-client
import { IoImageOutline, IoSend } from 'react-icons/io5';
import { ChatUser, ChatMessage } from './TeamChat';
import { getChatDetails, sendMessageToChat } from './api'; // Replace with actual API functions
import { getTeamChatDetails } from '@renderer/api/queries/commonqueries';
import { token } from '@renderer/api/config';
interface TeamChatSectionProps {
  user: ChatUser;
}

const TeamChatSection: React.FC<TeamChatSectionProps> = ({ user }) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const socketRef = useRef<Socket | null>(null); // Socket reference
  const queryClient = useQueryClient();

  // Fetch chat details using React Query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['team-chat-details', user.id],
    queryFn: () => getTeamChatDetails(user.id), // Replace with actual API call
    onSuccess: (data) => {
      setMessages(data.messages); // Assume `data.messages` contains chat messages
    },
  });

  // Send message mutation
  const { mutate: sendMessage } = useMutation({
    mutationFn: sendMessageToChat, // Replace with your API function
    onSuccess: (newMessage) => {
      setMessages((prev) => [...prev, newMessage]); // Add new message locally
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    },
  });

  // Initialize socket connection
  useEffect(() => {
    const socket = io('http://localhost:4000'); // Replace with your WebSocket server URL
    socketRef.current = socket;

    // Listen for incoming messages
    socket.on('message', (message: ChatMessage) => {
      if (message && message.type === 'received') {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Handle sending messages
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const message = {
      chatId: user.id,
      text: inputValue,
      type: 'sent',
      timestamp: new Date().toISOString(),
    };

    sendMessage(message); // Trigger mutation
    setInputValue('');

    // Emit message to the server via WebSocket
    socketRef.current?.emit('message', message);
  };

  // Handle image uploads
  const handleImageUpload = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      setUploadedImage(file);

      const reader = new FileReader();
      reader.onload = () => {
        const imageMessage: ChatMessage = {
          id: messages.length + 1,
          text: '',
          type: 'sent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          imageUrl: reader.result as string,
        };
        setMessages((prev) => [...prev, imageMessage]);

        // Dummy server response simulation
        setTimeout(() => {
          const responseMessage: ChatMessage = {
            id: imageMessage.id + 1,
            text: 'Great image! Thanks for sharing.',
            type: 'received',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, responseMessage]);
        }, 1000);
      };
      reader.readAsDataURL(file); // Convert image to Base64
    }
  };

  return (
    <div className="flex flex-col h-[90%]">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center">
          <img
            src={user.avatar}
            alt={`${user.name}'s avatar`}
            className="w-10 h-10 rounded-full mr-4"
          />
          <div>
            <div className="font-semibold text-gray-800">{user.name}</div>
            <div className="text-sm text-green-500">{user.status}</div>
            {user.isGroup && (
              <div className="text-xs text-gray-500">{user.groupMembers?.join(', ')}</div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {isLoading ? (
          <div>Loading messages...</div>
        ) : isError ? (
          <div>Error loading messages</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'} mb-2`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.type === 'sent' ? 'bg-green-100 text-gray-800' : 'bg-gray-200 text-gray-800'
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
          ))
        )}
      </div>

      {/* Input Field */}
      <div className="flex items-center p-4 border-t bg-white">
        {/* Image Upload Button */}
        <label
          htmlFor="image-upload"
          className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 mr-4"
        >
          <IoImageOutline className="w-6 h-6 text-gray-500" />
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
          placeholder="Type Anything"
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
