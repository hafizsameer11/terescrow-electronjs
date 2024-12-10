import React, { useState } from "react";
import { IoEyeOutline } from "react-icons/io5";
import ChatModal from "./modal/ChatModal";
import { Images } from "@renderer/constant/Image";

interface Chat {
  id: number;
  name: string;
  message: string;
  amount: string;
  agent: string;
  date: string;
  status: string;
}

interface ChatTableProps {
  data: Chat[];
}

const ChatTable: React.FC<ChatTableProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // Store customer data for the modal

  const handleEyeClick = (customer) => {
    setSelectedCustomer(customer); // Set the clicked customer's data
    setIsChatModalOpen(true); // Open the modal
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md">
      <table className="min-w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="py-3 px-4">Name, Chat</th>
            <th className="py-3 px-4">Amount</th>
            <th className="py-3 px-4">Agent</th>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((chat) => (
            <tr key={chat.id} className="border-t hover:bg-gray-50 relative">
              <td className="py-3 px-4">
                <div>
                  <span className="font-semibold">{chat.name}</span>
                  <span className="text-sm text-gray-500"> {chat.message}</span>
                </div>
              </td>
              <td className="py-3 px-4">{chat.amount}</td>
              <td className="py-3 px-4">{chat.agent}</td>
              <td className="py-3 px-4">{chat.date}</td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 text-xs rounded-lg ${chat.status === "Successful"
                    ? "bg-green-100 text-green-700"
                    : chat.status === "Declined"
                      ? "bg-red-100 text-red-700"
                      : chat.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : chat.status === "Unsuccessful"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-purple-100 text-purple-700"
                    }`}
                >
                  {chat.status}
                </span>
              </td>
              <td className="py-3 px-4 flex justify-between">
                <button
                  onClick={() => handleEyeClick(chat)} // Open modal on click
                  className="text-gray-500 hover:text-gray-700 focus:outline-none text-xl"
                >
                  <IoEyeOutline />
                </button>
                <button
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  &#x22EE; {/* Vertical ellipsis */}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center p-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg text-sm ${currentPage === 1
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg text-sm ${currentPage === totalPages
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
        >
          Next
        </button>
      </div>
      {isChatModalOpen && selectedCustomer && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          customer={{
            id: 1,
            name: "Hello ",
            username: "hhhasjd", // You can change this to match the username field
            avatar: Images.admin, // Replace with actual avatar URL
            agent: "CHecking",
          }}
          messages={[
            {
              id: 1,
              sender: "customer",
              text: "I want to trade $500...",
              timestamp: "2 mins ago",
              attachment: Images.chatImage, // Example attachment
            },
            {
              id: 2,
              sender: "agent",
              text: "I want to trade $500...",
              timestamp: "2 mins ago",
              attachment: Images.chatImage, // Example attachment
            },
          ]}
          onSendMessage={(msg) => console.log("Message sent:", msg)}
          onLogChatStatus={(status) => console.log("Chat status logged:", status)}
        />
      )}
    </div>

  );
};

export default ChatTable;
