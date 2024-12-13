import React, { useState, useEffect } from 'react'
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai'
import NotificationFilters from './NotificationFilters'
import WelcomeModal from './WelcomeModal'
import { Images } from '@renderer/constant/Image'
import AppBanner from './modal/AppBanner'
import NewNotificationModal from './modal/NewNotificationModal'

interface Transaction {
  message: string
  date: string
  createdBy: string
  deliveryStatus: string
}

const TransactionsTable: React.FC<{ textMsg: boolean; onTitleChange: (title: string) => void }> = ({
  textMsg,
  onTitleChange
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [notificationType, setNotificationType] = useState<string>('Notification')
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [isAppBannerOpen, setIsAppBannerOpen] = useState(false)

  const handleOpenNotificationModal = () => {
    setIsNotificationModalOpen(true)
  }

  const handleOpenModal = () => {
    if (notificationType === 'Notification') {
      setIsWelcomeModalOpen(true)
    } else {
      setIsAppBannerOpen(true)
    }
  }

  const handleCloseModal = () => {
    setIsWelcomeModalOpen(false)
    setIsAppBannerOpen(false)
  }

  useEffect(() => {
    const title = notificationType === 'Notification' ? 'Notifications' : 'In-App Banner'
    onTitleChange(title)
  }, [notificationType, onTitleChange])

  // Hardcoded data to match the image
  const data: Transaction[] = [
    {
      message: 'Welcome to tercesecrow, your no 1 hub for.......',
      date: 'Nov 8, 2024 - 11:22am',
      createdBy: 'Dave',
      deliveryStatus: 'Delivered'
    },
    {
      message: 'Welcome to tercesecrow, your no 1 hub for.......',
      date: 'Nov 8, 2024 - 11:22am',
      createdBy: 'Dave',
      deliveryStatus: 'Pending'
    },
    {
      message: 'Welcome to tercesecrow, your no 1 hub for.......',
      date: 'Nov 8, 2024 - 11:22am',
      createdBy: 'Dave',
      deliveryStatus: 'Failed'
    },
    {
      message: 'Welcome to tercesecrow, your no 1 hub for.......',
      date: 'Nov 8, 2024 - 11:22am',
      createdBy: 'Dave',
      deliveryStatus: 'Delivered'
    },
    {
      message: 'Welcome to tercesecrow, your no 1 hub for.......',
      date: 'Nov 8, 2024 - 11:22am',
      createdBy: 'Dave',
      deliveryStatus: 'Delivered'
    },
    {
      message: 'Welcome to tercesecrow, your no 1 hub for.......',
      date: 'Nov 8, 2024 - 11:22am',
      createdBy: 'Dave',
      deliveryStatus: 'Delivered'
    },
    {
      message: 'Welcome to tercesecrow, your no 1 hub for.......',
      date: 'Nov 8, 2024 - 11:22am',
      createdBy: 'Dave',
      deliveryStatus: 'Delivered'
    }
  ]

  const filteredData =
    statusFilter === 'All'
      ? data
      : data.filter((transaction) => transaction.deliveryStatus === statusFilter)

  const handleFilterChange = (updatedFilter: string, updatedNotificationType: string) => {
    setStatusFilter(updatedFilter)
    setNotificationType(updatedNotificationType)
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center py-4">
        <NotificationFilters
          deliveryOption={statusFilter}
          notificationType={notificationType}
          onChange={handleFilterChange}
        />
      </div>

      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2">Message</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Created By</th>
            <th className="px-4 py-2">Delivery Status</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((transaction, index) => (
            <tr key={index} className="border-b">
              {textMsg && notificationType === 'Notification' ? (
                <td className="px-4 py-2">{transaction.message}</td>
              ) : (
                <td className="px-4 py-2">
                  <img src={Images.tableImg} alt="" />
                </td>
              )}
              <td className="px-4 py-2">{transaction.date}</td>
              <td className="px-4 py-2">{transaction.createdBy}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded-md ${
                    transaction.deliveryStatus === 'Delivered'
                      ? 'text-green-500'
                      : transaction.deliveryStatus === 'Pending'
                        ? 'text-yellow-600'
                        : 'text-red-500'
                  }`}
                >
                  {transaction.deliveryStatus}
                </span>
              </td>
              <td className="px-4 py-2 space-x-2">
                <button
                  className="text-gray-500 bg-gray-100 p-2 rounded-lg"
                  onClick={handleOpenModal}
                >
                  <AiOutlineEye size={20} />
                </button>
                <button
                  className="text-gray-500 bg-gray-100 p-2 rounded-lg"
                  onClick={handleOpenNotificationModal}
                >
                  <AiOutlineEdit size={20} />
                </button>
                <button className="text-red-500">
                  <AiOutlineDelete size={22} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isWelcomeModalOpen && <WelcomeModal onClose={handleCloseModal} />}
      {isAppBannerOpen && (
        <AppBanner
          onSend={handleCloseModal}
          modalVisible={isAppBannerOpen}
          setModalVisible={setIsAppBannerOpen}
        />
      )}
      <NewNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onSubmit={() => setIsNotificationModalOpen(false)}
        actionType="edit"
        initialData={{
          title: 'teresecrow Notification',
          message: 'Sample notification message',
          imagePreview: 'https://via.placeholder.com/150',
          recipientType: 'customer',
          customerSelection: ['All']
        }}
      />
    </div>
  )
}

export default TransactionsTable
