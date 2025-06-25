import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavItem from './NavItem';
import { FaBell, FaCog } from 'react-icons/fa';
import { RiTeamFill } from 'react-icons/ri';
import { Images } from '@renderer/constant/Image';
import { useAuth, UserRoles } from '@renderer/context/authContext';
import TeamChat from '../TeamChat';
import { IoLogOutOutline } from "react-icons/io5";
import { MdOutlinePermIdentity } from "react-icons/md";
import { PiSlideshowThin } from "react-icons/pi";
import { FaReplyAll } from "react-icons/fa";
import { getAllDefaultChats } from '@renderer/api/queries/agent.queries';
import { useQuery } from '@tanstack/react-query';
import { getunreadMessageCount } from '@renderer/api/queries/commonqueries';
// import { useQuery } from 'react-query';


export const Sidebar = () => {
  const { userData, token } = useAuth();

  const navigate = useNavigate();
  const initialActiveItem = userData?.role === UserRoles.admin ? 'dashboard' : 'chats';
  const [activeItem, setActiveItem] = useState(initialActiveItem);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { dispatch } = useAuth();
  const previousCount = useRef<number>(0); // To store the previous count

  // const navigate = useNavigate();
  const handlogout = () => {
    console.log("Logout Called");
    dispatch({ type: 'LOGOUT' }); // Clear auth state
    navigate('/', { replace: true }); // Redirect to login
  };
  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [token]);

  // const {token}=useAuth();
  const { data: chatsData, isLoading: chatLoading, isError: chatIsError, error: chatError } = useQuery({
    queryKey: ['pendingChats'],
    queryFn: () => getAllDefaultChats(token),
    enabled: !!token,
    refetchInterval: 3000
  });

    const { data: count } = useQuery({
      queryKey: ['notificationCount'],
      queryFn: () => getunreadMessageCount(token),
      refetchInterval: 5000,
    });
    // const un
    const countData = count?.data;
    console.log('countData', countData)
    // const newCount = countData;
    // const ne
  const pendingChatsCount=chatsData?.data.length;
  console.log('chatscount', pendingChatsCount)
  // Define menus for admin and agent roles
  const adminMenuItems = [
    { label: 'Dashboard', icon: Images.dashboard, href: '/dashboard', id: 'dashboard' },
    { label: 'Customers', icon: Images.customer, href: '/customers', id: 'customers' },
    { label: 'Chats', icon: Images.chats, href: '/chats', id: 'chats' },
    { label: 'Transactions', icon: Images.transactions, href: '/transactions', id: 'transactions' },
    { label: 'Rates', icon: Images.rates, href: '/rates', id: 'rates' },
    { label: 'Log', icon: Images.log, href: '/log', id: 'log' },
    { label: 'Department', icon: Images.department, href: '/departments', id: 'department' },
    { label: 'Services', icon: <FaCog />, href: '/services', id: 'services' },
    { label: 'Teams', icon: Images.teams, href: '/teams', id: 'teams' },
    { label: 'Users', icon: Images.users, href: '/usersall', id: 'users' },
    { label: 'SMTP', icon: Images.email, href: '/smtp', id: 'smtp' },
    { label: 'KYC', icon: <MdOutlinePermIdentity />, href: '/kyc', id: 'kyc' },
    { label: 'Banners', icon: <PiSlideshowThin />, href: '/notifications/in-app/banners', id: 'banner' },
    { label: 'Ways Of Hearing', icon: <PiSlideshowThin />, href: '/WaysOfHearing', id: 'WaysOfHearing' },
  ];

  const agentMenuItems = useMemo(() => [
    { label: 'Chats', icon: Images.chats, href: '/chats', id: 'chats' ,badge:  countData > 0 ? countData : null},
    {
      label: 'Pending Chats',
      icon: Images.chats,
      href: '/pending-chats',
      id: 'pending-chats',
      badge: typeof pendingChatsCount === 'number' && pendingChatsCount > 0 ? pendingChatsCount : null,
    },
    { label: 'Quick Replies', icon: <FaReplyAll />, href: '/quick-replies', id: 'quick-replies' },
    { label: 'Transactions', icon: Images.transactions, href: '/transactions', id: 'transactions' },
  ], [pendingChatsCount,countData]);


  const bottomMenuItems = [
    { label: 'Notifications', icon: <FaBell />, href: '/notifications/', id: 'notifications' },

    { label: 'Settings', icon: <FaCog />, href: '/settings', id: 'settings' },
    { label: 'Team Chat', icon: <RiTeamFill />, href: '#', id: 'team-communication' },
    { label: 'Log Out', icon: <IoLogOutOutline />, href: '/logout', id: 'logout' }
  ];

  // Define menu for 'other' role based on permissions
  const otherMenuItems = userData?.customRole?.permissions
    .filter((perm) => perm.canSee)
    .map((perm) => ({
      label: perm.moduleName,
      icon: Images[perm.moduleName.toLowerCase()] || Images.user, // Assuming an Images map exists
      href: `/${perm.moduleName.toLowerCase()}`,
      id: perm.moduleName.toLowerCase(),
    })) || [];

  const menuItems =
    userData?.role === UserRoles.admin
      ? adminMenuItems
      : userData?.role === UserRoles.agent
        ? agentMenuItems
        : otherMenuItems;

  return (
    <aside className="lg:w-[280px] h-screen bg-white px-[20px] lg:px-[30px] text-gray-800 flex flex-col border-r border-[#989898] overflow-auto">
      <div className="flex items-start justify-start py-6">
        <img src={Images.logo} alt="Logo" className="h-8 lg:h-14 object-contain" />
      </div>
      <nav className="mt-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <NavItem
              key={item.id}
              label={item.label}
              icon={
                typeof item.icon === 'string' ? (
                  <img
                    src={item.icon}
                    alt={item.label}
                    className={`w-5 h-5 object-cover transition-colors ${activeItem === item.id ? 'image-tint' : ''
                      }`}
                  />
                ) : (
                  <span
                    className={`text-2xl transition-colors ${activeItem === item.id ? 'image-tint' : 'text-black'
                      }`}
                  >
                    {item.icon}
                  </span>
                )
              }
              href={item.id === 'team-communication' ? undefined : item.href}
              isActive={activeItem === item.id}
              onClick={() => {
                if (item.id === 'team-communication') {
                  setIsModalOpen(true);
                } else {
                  setActiveItem(item.id);
                }
              }}
              badge={item.badge} // Pass the badge prop
            />

          ))}
        </ul>
      </nav>

      <div className="border-t border-gray-200 mt-2">
        <ul className="space-y-1 mt-4">
          {bottomMenuItems.map((item) => (
            <NavItem
              key={item.id}
              label={item.label}
              isActive={activeItem === item.id}
              icon={
                <span
                  className={`text-2xl transition-colors ${activeItem === item.id ? 'image-tint text-white' : 'text-black'
                    }`}
                >
                  {item.icon}
                </span>
              }
              href={item.id === 'team-communication' || item.id === 'logout' ? undefined : item.href}
              onClick={() => {
                if (item.id === 'team-communication') {
                  setIsModalOpen(true);
                } else if (item.id === 'logout') {
                  handlogout(); // Call the logout handler
                } else {
                  setActiveItem(item.id);
                }
              }}
            />
          ))}
        </ul>
      </div>


      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center z-50">
          <div className="bg-white ms-10 w-full max-w-3xl rounded-lg shadow-lg relative">
            <TeamChat onClose={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </aside>
  );
};
