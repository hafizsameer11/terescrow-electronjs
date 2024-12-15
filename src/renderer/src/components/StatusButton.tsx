import { Icons } from '@renderer/constant/Icons'
import React from 'react'
interface StatusButtonProps {
  status: string,
  title: string
}


const StatusButton: React.FC<StatusButtonProps> = ({ title, status }) => {
  return (
    <div className={`py-1 px-2 w-[80%] text-sm font-medium flex items-center rounded-lg gap-3 ${status === "active"
      ? "bg-[#1473414D] text-[#147341] border border-[#147341]"
      : "bg-red-100 text-red-600"
      }`}>
        <span
                    className={`w-2 h-2 rounded-full ${
                      status === 'active' ? 'bg-green-700' : 'bg-red-700'
                    }`}
                  ></span>
      <span>

        {status === "active" ? "Active" : "Inactive"}
      </span>
    </div>
  )
}

export default StatusButton
