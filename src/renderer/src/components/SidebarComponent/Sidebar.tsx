import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavItem from './NavItem';
import { FaBell, FaCog, FaCreditCard, FaBitcoin, FaWallet, FaFileAlt, FaHeadset, FaUserFriends, FaClipboardList, FaExchangeAlt, FaChartLine } from 'react-icons/fa';
import { RiTeamFill } from 'react-icons/ri';
import { MdReceipt, MdAttachMoney } from 'react-icons/md';
import { Images } from '@renderer/constant/Image';
import { useAuth, UserRoles } from '@renderer/context/authContext';
import TeamChat from '../TeamChat';
import { IoLogOutOutline } from "react-icons/io5";
import { setReadOnlyDemoSession } from '@renderer/utils/appleReviewUser';
import { MdOutlinePermIdentity } from "react-icons/md";
import { PiSlideshowThin } from "react-icons/pi";
import { FaReplyAll } from "react-icons/fa";
import { getAllDefaultChats } from '@renderer/api/queries/agent.queries';
import { useQuery } from '@tanstack/react-query';
import { getunreadMessageCount } from '@renderer/api/queries/commonqueries';
// import { useQuery } from 'react-query';


const pathToIdMap: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/customers': 'customers',
  '/chats': 'chats',
  '/transactions/gift-card-buy': 'gift-card-buy-txns',
  '/transactions/crypto': 'crypto-txns',
  '/transactions/bill-payments': 'bill-payments',
  '/transactions/naira': 'naira-txns',
  '/transactions': 'transactions',
  '/user-balances': 'user-balances',
  '/rates': 'rates',
  '/log': 'log',
  '/departments': 'department',
  '/services': 'services',
  '/teams': 'teams',
  '/usersall': 'users',
  '/smtp': 'smtp',
  '/kyc': 'kyc',
  '/notifications/in-app/banners': 'banner',
  '/pending-chats': 'pending-chats',
  '/WaysOfHearing': 'WaysOfHearing',
  '/transaction-tracking': 'transaction-tracking',
  '/profit-tracker': 'profit-tracker',
  '/master-wallet': 'master-wallet',
  '/changenow-swaps': 'changenow-swaps',
  '/notifications': 'notifications',
  '/daily-report': 'daily-report',
  '/settings': 'settings',
  '/settings/vendors': 'vendors',
  '/support': 'support',
  '/referrals': 'referrals',
  '/crypto-jobs': 'crypto-jobs',
  '/deposit-verify-logs': 'deposit-verify-logs',
};

export const Sidebar = () => {
  const { userData, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const initialActiveItem = userData?.role === UserRoles.admin ? 'dashboard' : 'chats';
  const [activeItem, setActiveItem] = useState(initialActiveItem);

  useEffect(() => {
    const path = location.pathname;
    const id = pathToIdMap[path] || (path.startsWith('/customers') ? 'customers' : path.startsWith('/transaction-details') ? 'transactions' : null);
    if (id) setActiveItem(id);
  }, [location.pathname]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { dispatch } = useAuth();
  const previousCount = useRef<number>(0); // To store the previous count

  // const navigate = useNavigate();
  const handlogout = () => {
    console.log("Logout Called");
    setReadOnlyDemoSession(false);
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
    // refetchInterval: 3000
  });

    const { data: count } = useQuery({
      queryKey: ['notificationCount'],
      queryFn: () => getunreadMessageCount(token),
      // refetchInterval: 5000,
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
    { label: 'Gift Card Chats', icon: Images.chats, href: '/chats', id: 'gift-card-chats' },
    { label: 'Gift Card Buy Txns', icon: <FaCreditCard />, href: '/transactions/gift-card-buy', id: 'gift-card-buy-txns' },
    { label: 'Crypto Txns', icon: <FaBitcoin />, href: '/transactions/crypto', id: 'crypto-txns' },
    { label: 'Bill Payments', icon: <MdReceipt />, href: '/transactions/bill-payments', id: 'bill-payments' },
    { label: 'Naira Txns', icon: <MdAttachMoney />, href: '/transactions/naira', id: 'naira-txns' },
    { label: 'Transactions', icon: Images.transactions, href: '/transactions', id: 'transactions' },
    { label: 'User Wallets', icon: <FaWallet />, href: '/user-balances', id: 'user-balances' },
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
    { label: 'Deposit Tracking', icon: <FaClipboardList />, href: '/transaction-tracking', id: 'transaction-tracking' },
    { label: 'Deposit Verify Logs', icon: <FaClipboardList />, href: '/deposit-verify-logs', id: 'deposit-verify-logs' },
    { label: 'Crypto Jobs', icon: <FaBitcoin />, href: '/crypto-jobs', id: 'crypto-jobs' },
    { label: 'Profit Tracker', icon: <FaChartLine />, href: '/profit-tracker', id: 'profit-tracker' },
    { label: 'Master Wallet', icon: <FaWallet />, href: '/master-wallet', id: 'master-wallet' },
    { label: 'ChangeNOW Swaps', icon: <FaExchangeAlt />, href: '/changenow-swaps', id: 'changenow-swaps' },
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
    { label: 'Deposit Tracking', icon: <FaClipboardList />, href: '/transaction-tracking', id: 'transaction-tracking' },
    { label: 'Master Wallet', icon: <FaWallet />, href: '/master-wallet', id: 'master-wallet' },
    { label: 'Rates', icon: Images.rates, href: '/rates?tab=crypto', id: 'rates' },
    { label: 'Banners', icon: <PiSlideshowThin />, href: '/notifications/in-app/banners', id: 'banner' },
  ], [pendingChatsCount,countData]);


  const bottomMenuItems = [
    { label: 'Notifications', icon: <FaBell />, href: '/notifications/', id: 'notifications' },
    { label: 'Daily Report', icon: <FaFileAlt />, href: '/daily-report', id: 'daily-report', isGreenButton: true },
    { label: 'Settings', icon: <FaCog />, href: '/settings', id: 'settings' },
    { label: 'Vendors', icon: <FaWallet />, href: '/settings/vendors', id: 'vendors' },
    { label: 'Team Chat', icon: <RiTeamFill />, href: '#', id: 'team-communication' },
    { label: 'Support', icon: <FaHeadset />, href: '/support', id: 'support' },
    { label: 'Referrals', icon: <FaUserFriends />, href: '/referrals', id: 'referrals' },
    { label: 'Log Out', icon: <IoLogOutOutline />, href: '#', id: 'logout', isLogout: true }
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
                  className={`text-2xl transition-colors ${(item as any).isGreenButton ? 'text-white' : activeItem === item.id ? 'image-tint text-white' : 'text-black'}`}
                >
                  {item.icon}
                </span>
              }
              href={item.id === 'team-communication' || item.id === 'logout' ? '#' : item.href}
              isGreenButton={(item as any).isGreenButton}
              isLogout={(item as any).isLogout}
              onClick={() => {
                if (item.id === 'team-communication') {
                  setIsModalOpen(true);
                } else if (item.id === 'logout') {
                  handlogout();
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
