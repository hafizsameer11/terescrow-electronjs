import React, { useState } from 'react'
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai'
import NotificationFilters from './NotificationFilters'
import ChatConfirmModal from './ChatConfirmModal'
import WelcomeModal from './WelcomeModal'

interface Transaction {
  message: string
  date: string
  createdBy: string
  deliveryStatus: string
}

const TransactionsTable: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [notificationType, setNotificationType] = useState<string>('Banner')
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsWelcomeModalOpen(true)
  }
  const handleCloseModal = () => {
    setIsWelcomeModalOpen(false)
  }

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
              <td className="px-4 py-2">{transaction.message}</td>
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
                <button className="text-gray-500 bg-gray-100 p-2 rounded-lg">
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
    </div>
  )
}

export default TransactionsTable
