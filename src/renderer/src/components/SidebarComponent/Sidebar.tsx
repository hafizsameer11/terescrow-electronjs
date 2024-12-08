import React, { useState } from 'react';
import NavItem from './NavItem'; // Import the NavItem component
import {
  FaUser,
  FaComments,
  FaChartPie,
  FaMoneyCheckAlt,
  FaPercent,
  FaBook,
  FaUserTie,
  FaUsers,
  FaBell,
  FaCog,
} from 'react-icons/fa';

export const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('dashboard');

  // Navigation menu data
  const menuItems = [
    { label: 'Dashboard', icon: <FaChartPie />, href: '#dashboard', id: 'dashboard' },
    { label: 'Customers', icon: <FaUser />, href: '#customers', id: 'customers' },
    { label: 'Chats', icon: <FaComments />, href: '#chats', id: 'chats' },
    { label: 'Transactions', icon: <FaMoneyCheckAlt />, href: '#transactions', id: 'transactions' },
    { label: 'Rates', icon: <FaPercent />, href: '#rates', id: 'rates' },
    { label: 'Log', icon: <FaBook />, href: '#log', id: 'log' },
    { label: 'Department', icon: <FaUserTie />, href: '#department', id: 'department' },
    { label: 'Teams', icon: <FaUsers />, href: '#teams', id: 'teams' },
    { label: 'Users', icon: <FaUser />, href: '#users', id: 'users' },
  ];

  const bottomMenuItems = [
    { label: 'Notifications', icon: <FaBell />, href: '#notifications', id: 'notifications' },
    { label: 'Settings', icon: <FaCog />, href: '#settings', id: 'settings' },
  ];

  return (
    <aside className="w-[250px] h-screen bg-white text-gray-800 flex flex-col border-r border-gray-200 overflow-auto">
      {/* Logo Section */}
      <div className="flex items-center justify-center py-6 border-b border-gray-200">
        <img src="/path-to-logo.png" alt="Logo" className="w-10 h-10 object-contain" />
        <span className="ml-2 text-lg font-bold">Terescrow</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 mt-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <NavItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              href={item.href}
              isActive={activeItem === item.id}
              onClick={() => setActiveItem(item.id)}
            />
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 mt-2">
        <ul className="space-y-1 mt-4 px-2">
          {bottomMenuItems.map((item) => (
            <NavItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              href={item.href}
              isActive={activeItem === item.id}
              onClick={() => setActiveItem(item.id)}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
};
