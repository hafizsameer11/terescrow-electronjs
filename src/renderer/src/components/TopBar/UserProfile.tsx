import { getImageUrl } from '@renderer/api/helper';
import { Images } from '@renderer/constant/Image';
import { useAuth } from '@renderer/context/authContext';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile: React.FC = () => {
  const {userData}=useAuth();
  const navigate=useNavigate();
  return (
    <div className="flex items-center space-x-2"
    onClick={()=>navigate('/settings')}
    >
      <img

        src={getImageUrl(userData?.profilePicture)}
        alt="User Profile"
        className="w-20 h-20 rounded-full object-cover shadow-md"
      />
      <div>
        <span className="block text-xl font-[400] text[#000000CC] pb-2">Welcome</span>
        <span className="block text-sm text-[#00000080]">{userData?.username}</span>
      </div>
    </div>
  );
};

export default UserProfile;
