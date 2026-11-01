import React from 'react'
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'

interface StatsCardProps {
  title: string
  value: string | number | undefined
  change?: string
  isPositive?: boolean
  action?: string // Optional action label (e.g., "Edit" or "View")
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, isPositive = true }) => {
  const showChange = change != null && String(change).trim() !== ''

  return (
    <div className="p-4 sm:p-5 bg-white rounded-xl flex flex-col justify-between gap-3 min-w-0 border-[0.5px] border-[#9C9C9C]">
      {/* Title + change badge — flex so long labels never overlap the pill */}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <span
          className="text-[13px] sm:text-[14px] text-gray-400 leading-snug min-w-0 flex-1 break-words"
          title={title}
        >
          {title}
        </span>
        {showChange ? (
          <div
            className={`shrink-0 flex items-center gap-1 text-sm font-light ${
              isPositive ? 'text-[#147341]' : 'text-red-500'
            } border border-[#9C9C9C] rounded-full px-2 py-0.5`}
          >
            {isPositive ? (
              <FaArrowUp style={{ fontSize: 8 }} />
            ) : (
              <FaArrowDown style={{ fontSize: 8 }} />
            )}
            <span className="text-[10px] whitespace-nowrap">{change}</span>
          </div>
        ) : null}
      </div>

      <span className="text-lg sm:text-xl xl:text-2xl font-medium text-[#000000CC] tabular-nums leading-tight break-all">
        {value}
      </span>
    </div>
  )
}

export default StatsCard
