import React from 'react';
import OnlineAgents from './OnlineAgents';
import UserProfile from './UserProfile';

const TopBar: React.FC = () => {
  return (
    <header className="flex justify-end items-center w-full bg-white px-8 py-2 border-b border-gray-200">
      {/* Online Agents */}
      <div className="flex items-center mr-[4rem]">
        {/* <span className="text-sm text-gray-600 mr-4 font-medium">Online Agents</span> */}
        <OnlineAgents />
      </div>

      {/* User Profile */}
      <UserProfile />
    </header>
  );
};

export default TopBar;
