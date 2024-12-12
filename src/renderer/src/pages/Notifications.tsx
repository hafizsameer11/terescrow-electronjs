import { useState } from 'react'
import TransactionsTable from '@renderer/components/NotificationTable'
import NewNotificationModal from '@renderer/components/modal/NewNotificationModal'
import NewBannerModal from '@renderer/components/modal/NewBannerModal' // Import NewBannerModal

interface Notification {
  type: 'Team' | 'Customer'
  message: string
  time: string
  isImportant?: boolean
}

const notifications: Notification[] = [
  { type: 'Team', message: 'Agent Sarah sent you a chat.', time: 'Nov 7, 2024, 9:26 AM' },
  { type: 'Team', message: 'Agent Sarah sent you a chat.', time: 'Nov 7, 2024, 9:26 AM' },
  { type: 'Team', message: 'Agent Sarah sent you a chat.', time: 'Nov 7, 2024, 9:26 AM' },
  {
    type: 'Team',
    message: 'Agent Alucard just cancelled a trade.',
    time: 'Nov 7, 2024, 9:26 AM',
    isImportant: true
  },
  { type: 'Team', message: 'Agent Sarah sent you a chat.', time: 'Nov 7, 2024, 9:26 AM' },
  { type: 'Customer', message: '@Ade01 just bought a gift card.', time: 'Nov 7, 2024, 9:26 AM' },
  { type: 'Customer', message: '@Ade01 just sold USDT.', time: 'Nov 7, 2024, 9:26 AM' }
]

const Notifications = () => {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [title, setTitle] = useState<string>('Notifications')
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false) // State for NewBannerModal
  const [activeOption, setActiveOption] = useState<'Notifications' | 'In-App Notification'>(
    'Notifications'
  )

  const handleOpenNotificationModal = () => {
    setIsNotificationModalOpen(true)
  }
  const handleCloseNotificationModal = () => {
    setIsNotificationModalOpen(false)
  }

  // Open the NewBannerModal when the button is clicked
  const handleOpenBannerModal = () => {
    setIsBannerModalOpen(true)
  }

  const handleCloseBannerModal = () => {
    setIsBannerModalOpen(false)
  }

  const titleChange = (newTitle: string) => {
    setTitle(newTitle)
  }

  return (
    <div className="w-full">
      <div className="flex mb-5 justify-between">
        <div className="flex">
          <h1 className="text-[40px] text-gray-800 pr-6">{title}</h1>
          {title === 'Notifications' && (
            <div className="flex">
              <button
                onClick={() => setActiveOption('Notifications')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeOption === 'Notifications'
                    ? 'text-white bg-green-700'
                    : 'text-gray-800 border border-gray-300'
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveOption('In-App Notification')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeOption === 'In-App Notification'
                    ? 'text-white bg-green-700'
                    : 'text-gray-800 border border-gray-300'
                }`}
              >
                In-App Notification
              </button>
            </div>
          )}
        </div>
        <div>
          {activeOption === 'In-App Notification' && (
            <div className="flex gap-5">
              <button
                className="px-4 py-2 rounded-lg font-medium text-green-700 bg-transparent border border-green-700"
                onClick={handleOpenBannerModal}
              >
                Upload Banner
              </button>
              <button
                className="px-4 py-3 rounded-lg font-medium text-white bg-green-700"
                onClick={handleOpenNotificationModal}
              >
                New Notification
              </button>
            </div>
          )}
        </div>
      </div>

      {activeOption === 'Notifications' && (
        <div className="w-full p-6 ">
          <div className="flex gap-6">
            <div className=" border bg-white rounded-md w-1/2 p-8 shadow-md">
              <h2 className="font-bold text-lg mb-4">Team Notification</h2>
              {notifications
                .filter((n) => n.type === 'Team')
                .map((notification, index) => (
                  <div key={index}>
                    <p>
                      <span className="font-bold">{notification.message}</span>
                      {notification.isImportant && (
                        <span className="text-red-500 font-bold ml-1">•</span>
                      )}
                      <span className="text-green-600 ml-2 cursor-pointer">view details</span>
                    </p>
                    <p className="text-gray-500 text-sm">{notification.time}</p>
                  </div>
                ))}
            </div>

            <div className="border bg-white rounded-md p-8 w-1/2 shadow-md">
              <h2 className="font-bold text-lg mb-4">Customer Notification</h2>
              {notifications
                .filter((n) => n.type === 'Customer')
                .map((notification, index) => (
                  <div key={index} className="">
                    <p>
                      <span className="font-bold">{notification.message}</span>
                      <span className="text-green-600 ml-2 cursor-pointer ">view transaction</span>
                    </p>
                    <p className="text-gray-500 text-sm">{notification.time}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeOption === 'In-App Notification' && (
        <div>
          <TransactionsTable textMsg={true} onTitleChange={titleChange} />
        </div>
      )}

      <NewNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={handleCloseNotificationModal}
        onSubmit={handleCloseNotificationModal}
      />

      <NewBannerModal
        modalVisible={isBannerModalOpen}
        setModalVisible={setIsBannerModalOpen}
        onSend={handleCloseBannerModal}
      />
    </div>
  )
}

export default Notifications
