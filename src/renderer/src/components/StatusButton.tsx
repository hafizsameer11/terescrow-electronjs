import { Icons } from '@renderer/constant/Icons'
import React from 'react'
interface StatusButtonProps {
  status: string,
  title: string
}


const StatusButton: React.FC<StatusButtonProps> = ({ title, status }) => {
  return (
    <div className={`py-1 px-2 w-[60%] text-sm font-medium flex rounded-lg gap-3 ${status === "Active"
      ? "bg-[#1473414D] text-[#147341] border border-[#147341]"
      : "bg-red-100 text-red-600"
      }`}>
      <img src={Icons.active} alt="" />
      <span>

        {title}
      </span>
    </div>
  )
}

export default StatusButton
