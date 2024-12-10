import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { IoImageOutline } from "react-icons/io5";
import ModalHeader from "./ChatModalHeader";

interface Message {
  id: number;
  sender: "agent" | "customer";
  text: string;
  timestamp: string;
  attachment?: string; // URL of the image/attachment
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id: number;
    name: string;
    username: string;
    avatar: string;
    agent: string;
  };
  messages: Message[];
  onSendMessage: (message: string, attachment?: File | null) => void;
  onLogChatStatus: (status: string) => void;
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  customer,
  messages,
  onSendMessage,
  onLogChatStatus,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>(messages);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (newMessage.trim() || selectedImage) {
      const newChatMessage: Message = {
        id: chatMessages.length + 1,
        sender: "agent",
        text: newMessage,
        timestamp: new Date().toLocaleTimeString(),
        attachment: selectedImage ? URL.createObjectURL(selectedImage) : undefined,
      };
      setChatMessages([...chatMessages, newChatMessage]);
      setNewMessage("");
      setSelectedImage(null); // Clear the selected image
      onSendMessage(newMessage, selectedImage); // Pass to the handler
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage(e.target.files[0]);
    }
  };

  // Scroll to the bottom when new messages are added
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-lg w-[600px] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <ModalHeader
          customer={customer}
          onClose={onClose}
          onLogChat={() => onLogChatStatus("Logged")}
          onSendRate={() => console.log("Send Rate Clicked")}
          onOpenNotes={() => console.log("Open Notes Clicked")}
        />

        {/* Chat Body */}
        <div
          ref={chatBodyRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ maxHeight: "60vh" }}
        >
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`${
                  msg.sender === "agent"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                } rounded-lg px-4 py-2 max-w-[70%]`}
              >
                {msg.attachment && (
                  <img
                    src={msg.attachment}
                    alt="attachment"
                    className="w-40 h-40 object-cover mb-2 rounded-md"
                  />
                )}
                <p>{msg.text}</p>
                <p className="text-xs text-gray-500 mt-1">{msg.timestamp}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t flex items-center gap-2 relative">
          {/* Image Upload */}
          <label
            htmlFor="imageUpload"
            className="cursor-pointer text-gray-500 hover:text-gray-700"
          >
            <IoImageOutline className="text-2xl" />
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {/* Selected Image Preview */}
          {selectedImage && (
            <div className="absolute bottom-full left-4 bg-white border rounded-md p-2 shadow-md">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="preview"
                className="w-20 h-20 object-cover rounded-md"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="block text-xs text-red-600 mt-1 hover:underline"
              >
                Remove
              </button>
            </div>
          )}

          {/* Message Input */}
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <FaPaperPlane />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
