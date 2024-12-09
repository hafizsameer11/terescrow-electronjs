import { Images } from '@renderer/constant/Image';
import React from 'react';

const UserProfile: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <img
        src={Images.admin}
        alt="User Profile"
        className="w-20 h-20 rounded-full object-cover shadow-md"
      />
      <div>
        <span className="block text-xl font-[400] text[#000000CC] pb-2">Welcome</span>
        <span className="block text-sm text-[#00000080]">Qamardeen</span>
      </div>
    </div>
  );
};

export default UserProfile;
