import React from 'react'
import { Link } from 'react-router-dom'

interface NavItemProps {
  label: string
  icon: React.ReactNode
  href: string
  isActive?: boolean
  onClick?: () => void
}

const NavItem: React.FC<NavItemProps> = ({ label, icon, href, isActive, onClick }) => {
  return (
    <li>
      <Link
        title={label}
        to={href} // Use 'to' instead of 'href'
        onClick={onClick}
        className={`flex w-fit lg:w-full items-center px-[18px] py-[16px] rounded-md transition-colors ${isActive
            ? 'bg-[#147341] text-white'
            : href === '/logout'
              ? 'text-red-600 hover:bg-red-100'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
      >
        <div className="lg:mr-3">{icon}</div>
        <div className="hidden lg:block">{label}</div>
      </Link>
    </li>
  )
}

export default NavItem
