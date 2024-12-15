import { useState } from 'react'
import NavItem from './NavItem' // Import the NavItem component
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
  FaUserTag,
} from 'react-icons/fa'
import { RiTeamFill } from 'react-icons/ri'
import { Images } from '@renderer/constant/Image'

export const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('dashboard')

  // Navigation menu data
  const menuItems = [
    { label: 'Dashboard', icon: <FaChartPie />, href: '/dashboard', id: 'dashboard' },
    { label: 'Customers', icon: <FaUser />, href: '/customers', id: 'customers' },
    { label: 'Chats', icon: <FaComments />, href: '/chats', id: 'chats' },
    { label: 'Transactions', icon: <FaMoneyCheckAlt />, href: '/transactions', id: 'transactions' },
    { label: 'Rates', icon: <FaPercent />, href: '/rates', id: 'rates' },
    { label: 'Log', icon: <FaBook />, href: '/log', id: 'log' },
    { label: 'Department', icon: <FaUserTie />, href: '/departments', id: 'department' },
    { label: 'Services', icon: <FaUserTag />, href: '/services', id: 'services' },
    { label: 'Teams', icon: <FaUsers />, href: '/teams', id: 'teams' },
    { label: 'Users', icon: <FaUser />, href: '/usersall', id: 'users' }
  ]

  const bottomMenuItems = [
    { label: 'Notifications', icon: <FaBell />, href: '/notifications', id: 'notifications' },
    { label: 'Settings', icon: <FaCog />, href: '/settings', id: 'settings' },
    {
      label: 'Team Communication',
      icon: <RiTeamFill />,
      href: '/team-communication',
      id: 'team-communication'
    }
  ]

  return (
    <aside className="lg:w-[280px] h-screen bg-white px-[20px] lg:px-[30px] text-gray-800 flex flex-col border-r border-[#989898] overflow-auto">
      {/* Logo Section */}
      <div className="flex items-start justify-start py-6">
        <img src={Images.logo} alt="Logo" className="h-8 lg:h-14 object-contain" />
        {/* <span className="ml-2 text-lg font-bold">Terescrow</span> */}
      </div>

      {/* Navigation Links */}
      <nav className="mt-4">
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
        <ul className="space-y-1 mt-4">
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
  )
}
