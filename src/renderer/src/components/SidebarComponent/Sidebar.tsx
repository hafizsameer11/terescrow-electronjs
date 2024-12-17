import { useState, useEffect } from 'react'
import NavItem from './NavItem' // Import the NavItem component
import { FaBell, FaCog, FaUserTag } from 'react-icons/fa'
import { RiTeamFill } from 'react-icons/ri'
import { Images } from '@renderer/constant/Image'
import { useAuth, UserRoles } from '@renderer/context/authContext'

export const Sidebar = () => {
  const { userData } = useAuth()
  const initialActiveItem = userData?.role === UserRoles.admin ? 'dashboard' : 'chats'
  const [activeItem, setActiveItem] = useState(initialActiveItem)

  const adminMenuItems = [
    { label: 'Dashboard', icon: Images.dashboard, href: '/dashboard', id: 'dashboard' },
    { label: 'Customers', icon: Images.customer, href: '/customers', id: 'customers' },
    { label: 'Chats', icon: Images.chats, href: '/chats', id: 'chats' },
    { label: 'Transactions', icon: Images.transactions, href: '/transactions', id: 'transactions' },
    { label: 'Rates', icon: Images.rates, href: '/rates', id: 'rates' },
    { label: 'Log', icon: Images.log, href: '/log', id: 'log' },
    { label: 'Department', icon: Images.department, href: '/departments', id: 'department' },
    { label: 'Services', icon: <FaUserTag />, href: '/services', id: 'services' },
    { label: 'Teams', icon: Images.teams, href: '/teams', id: 'teams' },
    { label: 'Users', icon: Images.users, href: '/usersall', id: 'users' }
  ]

  const agentMenuItems = [
    { label: 'Chats', icon: Images.chats, href: '/chats', id: 'chats' },
    { label: 'Transactions', icon: Images.transactions, href: '/transactions', id: 'transactions' }
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
  console.log('sidebar', userData?.role)

  const menuItems = userData?.role === UserRoles.admin ? adminMenuItems : agentMenuItems

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
                    className={`w-5 h-5 object-cover transition-colors ${
                      activeItem === item.id ? 'image-tint' : ''
                    }`}
                  />
                ) : (
                  <span
                    className={`text-2xl transition-colors ${
                      activeItem === item.id ? 'image-tint' : 'text-black'
                    }`}
                  >
                    {item.icon}
                  </span>
                )
              }
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
              isActive={activeItem === item.id}
              icon={
                <span
                  className={`text-2xl transition-colors ${
                    activeItem === item.id
                      ? 'image-tint text-white fill-white stroke-white'
                      : 'text-black'
                  }`}
                >
                  {item.icon}
                </span>
              }
              href={item.href}
              onClick={() => setActiveItem(item.id)}
            />
          ))}
        </ul>
      </div>
    </aside>
  )
}
