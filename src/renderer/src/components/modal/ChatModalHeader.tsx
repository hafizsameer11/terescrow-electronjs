import React, { useState } from "react";
import { IoClose, IoEllipsisHorizontal } from "react-icons/io5";
import { FaStickyNote } from "react-icons/fa";
import { Icons } from "@renderer/constant/Icons";

interface HeaderProps {
  customer: {
    name: string;
    username: string;
    avatar: string;
  };
  onClose: () => void;
  onLogChat: () => void;
  onSendRate: () => void;
  onOpenNotes: () => void; // To handle notes icon click
}

const ModalHeader: React.FC<HeaderProps> = ({
  customer,
  onClose,
  onLogChat,
  onSendRate,
  onOpenNotes,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="p-4 flex items-center justify-between border-b">
      {/* Left Section: Close Button and Customer Info */}
      <div className="flex items-center gap-2">
        <button
          onClick={onClose}
          className="text-gray-500 text-xl hover:text-gray-800"
        >
          <img className="w-4" src={Icons.darkCross} alt="" />
        </button>
        <img
          src={customer.avatar}
          alt={customer.name}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h4 className="font-semibold text-gray-800">{customer.name}</h4>
          <span className="text-sm text-gray-500">@{customer.username}</span>
        </div>
      </div>

      {/* Right Section: Buttons and Dropdown */}
      <div className="flex items-center gap-2 relative">
        {/* Send Rate Button */}
        <button
          onClick={onSendRate}
          className="border border-[#147341] text-[#147341] px-2 py-2 rounded-[12px] hover:bg-green-100"
        >
          Send Rate
        </button>
        {/* Log Chat Button */}
        <button
          onClick={onLogChat}
          className="bg-[#147341] text-white px-2 py-2 rounded-[12px] hover:bg-green-700"
        >
          Log Chat
        </button>
        {/* Notes Icon */}
        <button
          onClick={onOpenNotes}
          className="text-gray-500 text-xl hover:text-gray-800"
        >
          {/* < /> */}
          <img src={Icons.notes} alt="" />
        </button>
        {/* Three Dots Dropdown */}
        <button
          onClick={toggleDropdown}
          className="text-gray-500 text-xl hover:text-gray-800"
        >
          <IoEllipsisHorizontal />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 top-10 bg-white shadow-lg rounded-md border w-40 z-50">
            <ul>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                Option 1
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                Option 2
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                Option 3
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalHeader;
