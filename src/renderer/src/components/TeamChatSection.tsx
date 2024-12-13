import React, { useState, useEffect } from 'react';
import { ChatUser, ChatMessage } from './TeamChat';
import { IoImageOutline, IoSend } from 'react-icons/io5';

interface TeamChatSectionProps {
  user: ChatUser;
}

const TeamChatSection: React.FC<TeamChatSectionProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Initialize with an empty array
  const [inputValue, setInputValue] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  // Update messages when the user changes
  useEffect(() => {
    setMessages([...user.messages]); // Reset messages to the new user's messages
  }, [user]);

  // Convert File to Base64
  const handleImageUpload = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64Image = reader.result as string;
        const newMessage: ChatMessage = {
          id: messages.length + 1,
          text: '',
          type: 'sent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          imageUrl: base64Image,
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]);

        // Dummy response for image upload
        setTimeout(() => {
          const dummyResponse: ChatMessage = {
            id: newMessage.id + 1,
            text: 'Nice image! Let me check.',
            type: 'received',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prevMessages) => [...prevMessages, dummyResponse]);
        }, 1000);
      };

      reader.readAsDataURL(file); // Convert file to Base64
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessage: ChatMessage = {
      id: messages.length + 1,
      text: inputValue.trim(),
      type: 'sent',
      timestamp,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue('');

    // Dummy response for text messages
    setTimeout(() => {
      const dummyResponse: ChatMessage = {
        id: newMessage.id + 1,
        text: 'Got it! Let me check.',
        type: 'received',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prevMessages) => [...prevMessages, dummyResponse]);
    }, 1000);
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
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'} mb-2`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${message.type === 'sent' ? 'bg-green-100 text-gray-800' : 'bg-gray-200 text-gray-800'
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
