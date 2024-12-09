import React from 'react';

interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, icon, href, isActive, onClick }) => {
  return (
    <li>
      <a
        href={href}
        onClick={onClick}
        className={`flex items-center px-[18px] py-[16px] rounded-md transition-colors ${
          isActive
            ? 'bg-[#147341] text-white'
            : 'text-gray-800 hover:bg-gray-100'
        }`}
      >
        <span className="mr-3">{icon}</span>
        {label}
      </a>
    </li>
  );
};

export default NavItem;
