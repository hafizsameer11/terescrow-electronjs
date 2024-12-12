import UserDetail from '@renderer/components/UserDetail'
import { useState } from 'react'
const Settings = () => {
  const [activeChat, setActiveChat] = useState<'giftCard' | 'crypto'>('giftCard')
  return (
    <div className="p-6 space-y-8 w-full">
      <div className="flex justify-between gap-9">
        <div>
          <h1 className="text-[40px] text-gray-800 font-normal">Settings</h1>

          {/* Toggle Buttons */}
          <div className="flex items-center mt-5">
            <div>
              <button
                onClick={() => setActiveChat('giftCard')}
                className={`px-4 py-2 rounded-tl-lg rounded-bl-lg font-medium ${
                  activeChat === 'giftCard'
                    ? 'text-white bg-green-700'
                    : 'text-gray-800 border border-gray-300'
                }`}
              >
                Profile
              </button>
            </div>
            <div>
              <button
                onClick={() => setActiveChat('crypto')}
                className={`px-4 py-2 rounded-tr-lg rounded-br-lg font-medium ${
                  activeChat === 'crypto'
                    ? 'text-white bg-green-700'
                    : 'text-gray-800 border border-gray-300'
                }`}
              >
                Role Management
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end items-center flex-1">
          <button className="px-4 py-2 rounded-xl font-normal bg-red-600 text-white w-1/5">
            Logout
          </button>
        </div>
      </div>
      <UserDetail />
    </div>
  )
}

export default Settings
