import React, { useEffect, useState, useRef } from 'react';
import OnlineAgents from './OnlineAgents';
import UserProfile from './UserProfile';
import OnlineAgentsModal from '../OnlineAgentsModal';
import { useAuth } from '@renderer/context/authContext';
import { useQuery } from '@tanstack/react-query';
import { getCustomerNotifications, getTeamNotifications, getunreadMessageCount } from '@renderer/api/queries/commonqueries';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { Images } from '@renderer/constant/Image';
import { AiOutlineTeam } from "react-icons/ai";
import TeamChat from '../TeamChat';


const TopBar: React.FC = () => {
  const [modalVisibility, setModalVisibility] = useState(false);
  const navigate = useNavigate();
  const handleToggleModal = () => {
    setModalVisibility(!modalVisibility);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token, userData } = useAuth();
  const previousCount = useRef<number>(0); // To store the previous count
  const previousCustomerNotifications = useRef<any[]>([]);
  const previousTeamNotifications = useRef<any[]>([]);
  const seenCustomerNotificationIds = useRef<Set<string | number>>(new Set());
  const seenTeamNotificationIds = useRef<Set<string | number>>(new Set());
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then((permission) => {
        if (permission !== 'granted') {
          console.warn('Notification permission denied');
        }
      });
    }
  }, []);

  const { data: count } = useQuery({
    queryKey: ['notificationCount'],
    queryFn: () => getunreadMessageCount(token),
    refetchInterval: 5000,
  });
  const {
    data: customerNotifications,
    isLoading: customerNotificationsLoading,
  } = useQuery({
    queryKey: ['customernotifications'],
    refetchInterval: 2000,
    queryFn: () => getCustomerNotifications(token),
    // refetchInterval: 5000,
  });
  const {
    data: teamNotifications,
    isLoading: teamNotificationsLoading,
  } = useQuery({
    queryKey: ['teamnotifications'],
    refetchInterval: 2000,
    queryFn: () => getTeamNotifications(token),
  });
  console.log('teamNotifications', teamNotifications);
  useEffect(() => {
    if (count?.data !== undefined) {
      const newCount = count.data;


      if (newCount > previousCount.current) {
        if (window.Notification) {
          new Notification('New Messages', {
            body: `You have ${newCount} unread messages.`,
            icon: Images.logo
          });
        }
      }

      // Update the previous count
      previousCount.current = newCount;
    }
  }, [count]);
  useEffect(() => {
    if (teamNotifications?.data) {
      const newItem = teamNotifications.data.find(
        (item) => !seenTeamNotificationIds.current.has(item.id)
      );

      if (newItem && window.Notification) {
        new Notification('Team Notification', {
          body: newItem.description,
          icon: Images.logo,
        });
        seenTeamNotificationIds.current.add(newItem.id);
      }
    }
  }, [teamNotifications]);


  useEffect(() => {
    if (customerNotifications?.data) {
      const newItem = customerNotifications.data.find(
        (item) => !seenCustomerNotificationIds.current.has(item.id)
      );

      if (newItem && window.Notification) {
        new Notification('Customer Notification', {
          body: newItem.description,
          icon: Images.logo,
        });
        seenCustomerNotificationIds.current.add(newItem.id);
      }
    }
  }, [customerNotifications]);



  console.log('customerNotifications', customerNotifications);
  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  return (
    <header className="flex justify-end items-center w-full bg-white px-8 py-2 border-b border-gray-200">
      {/* Online Agents */}
      <button onClick={handleToggleModal} className="flex items-center mr-[4rem]">
        {userData?.role === 'admin' && <OnlineAgents />}
      </button>
      <button onClick={handleNotificationClick} className="flex items-center mr-[1rem] text-[2rem] mt-[2rem] relative">
        <IoIosNotificationsOutline />
        <span className="text-[10px] absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
          {count?.data}
        </span>
      </button>
      <button onClick={() => setIsModalOpen(true)} className="flex items-center mr-[1rem] text-[2rem] mt-[2rem] relative">
        <AiOutlineTeam />

      </button>
      {modalVisibility && <OnlineAgentsModal onCLose={handleToggleModal} />}

      {/* User Profile */}
      <UserProfile />
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center z-50">
          <div className="bg-white ms-10 w-full max-w-3xl rounded-lg shadow-lg relative">
            <TeamChat onClose={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;
