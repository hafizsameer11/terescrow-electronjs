// import { title } from 'process';
import React from 'react'
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'

// interface StatsCardProps:{
//   title:string,
interface StatsCardProps {
  title: string
  value: string | number | undefined
  change?: string
  isPositive?: boolean
  action?: string // Optional action label (e.g., "Edit" or "View")
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, isPositive = true }) => {
  return (
    <div className="p-6 bg-white rounded-xl  flex flex-col justify-between space-y-4 relative  border-[0.5px] border-[#9C9C9C]">
      {/* Title */}
      <span className="text-[14px] text-gray-400">{title}</span>

      {/* Value */}
      <span className="text-sm lg:text-[24px] xl:text-[24px] font-medium text-[#000000CC]">{value}</span>

      {/* Percentage Change */}
      <div
        className={`absolute top-0 right-4 flex items-center space-x-1 text-sm font-light ${
          isPositive ? 'text-[#147341]' : 'text-red-500'
        } border border-[#9C9C9C] rounded-full px-2 py-1`}
      >
        {isPositive ? (
          <FaArrowUp style={{ fontSize: 8 }} />
        ) : (
          <FaArrowDown style={{ fontSize: 8 }} />
        )}
        {change !== '' && <span className='text-[10px]'>{change}</span>}
      </div>
    </div>
  )
}

export default StatsCard
