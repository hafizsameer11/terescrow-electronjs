// import { title } from 'process';
import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

// interface StatsCardProps:{
//   // title:string,
// }

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, isPositive = true }) => {
  return (
    <div className="p-6 bg-white rounded-lg  flex flex-col justify-between space-y-4 relative  border-[0.5px] border-[#9C9C9C]">
      {/* Title */}
      <span className="text-sm light-text-400">{title}</span>

      {/* Value */}
      <span className="text-[24px] font-normal text-[#000000CC]">{value}</span>

      {/* Percentage Change */}
      <div
        className={`absolute top-2 right-4 flex items-center space-x-1 text-sm font-light ${
          isPositive ? 'text-[#147341]' : 'text-red-500'
        } border border-[#9C9C9C] rounded-full px-2 py-1`}
      >
        {isPositive ? <FaArrowUp /> : <FaArrowDown />}
        <span>{change}</span>
      </div>
    </div>
  );
};

export default StatsCard;
