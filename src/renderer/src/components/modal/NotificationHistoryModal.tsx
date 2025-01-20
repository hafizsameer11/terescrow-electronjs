import { InappNotification } from "@renderer/api/queries/datainterfaces";
import { Icons } from "@renderer/constant/Icons";
import React, { useState } from "react";

interface NotificationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: InappNotification[];
  onNewNotification: () => void;
}

const NotificationHistoryModal: React.FC<NotificationHistoryModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onNewNotification,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-10">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-[600px]">
        <div className="flex flex-col relative">
          <button
            onClick={onClose}
            className=" text-gray-500 hover:text-gray-800 text-2xl  flex justify-end mb-4 "
          >
            <img src={Icons.cross} alt="" className="w-4" />
          </button>
          <div className="flex justify-between items-center pb-4 mb-4 border-b">

            <h2 className="text-lg font-semibold text-gray-700">Notes History</h2>
            <button
              onClick={onNewNotification}
              className="bg-[#147341] text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              New Notification
            </button>
          </div>

        </div>
        <div className="overflow-y-auto max-h-[300px]">
          {notifications.map((notification) => (
            <div
              key={notification.id}
            className="p-4 bg-gray-50 rounded-lg mb-4"
            >
              <div className="text-gray-700 font-semibold mb-2">
                {notification.description}
              </div>
              <div className="text-sm text-gray-500 flex justify-between">
                <div>
                  {notification.createdAt}
                </div>
                {/* <div>{notification.status}</div> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationHistoryModal;
