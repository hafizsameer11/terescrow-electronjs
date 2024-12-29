// import { title } from 'process';
import React from 'react'
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'

// interface StatsCardProps:{
//   title:string,
interface StatsCardProps {
  title: string
  value: number | string
  showStats?: boolean
  change?: string // e.g., +1% or -1%
  isPositive?: boolean // Determines if the change is positive or negative
  action?: string // Optional action label (e.g., "Edit" or "View")
}

const UserStat: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  showStats = false
}) => {
  return (
    <div className="p-6 bg-white rounded-lg  flex flex-col justify-between space-y-4 relative  border-[0.5px] border-[#9C9C9C]">
      {/* Title */}
      <span className="text-sm light-text-400">{title}</span>

      {/* Value */}
      <span className="text-[24px] font-normal text-[#000000CC]">{value}</span>

      {/* Percentage Change */}
      {showStats && (
        <div
          className={`absolute top-2 right-4 flex items-center space-x-1 text-sm font-light ${
            isPositive ? 'text-[#147341]' : 'text-red-500'
          } border border-[#9C9C9C] rounded-full px-2 py-1`}
        >
          {isPositive ? <FaArrowUp /> : <FaArrowDown />}
          <span>{change}</span>
        </div>
      )}
    </div>
  )
}

export default UserStat
