import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NewNotificationModal from './modal/NewNotificationModal'
import NotificationHistoryModal from './modal/NotificationHistoryModal'
import { Customer } from '@renderer/api/queries/datainterfaces'
// import NotificationHistoryModal from "./NotificationHistoryModal";
// import NewNotificationModal from "./NewNotificationModal";

interface CustomerTableProps {
  data: Customer[]
}

const UserTable: React.FC<CustomerTableProps> = ({ data }) => {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false)
  const [isNewNotificationModalOpen, setIsNewNotificationModalOpen] = useState<boolean>(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      content: 'Your trade was successfully completed!',
      date: 'Nov 7, 2024 - 10:22 am',
      sentBy: 'Alucard',
      status: 'Delivered'
    }
  ])

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const totalPages =10
  const paginatedData = data

  const toggleMenu = (id: number) => {
    setActiveMenu(activeMenu === id ? null : id)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleNewNotificationClick = () => {
    setIsNotificationModalOpen(false)
    setIsNewNotificationModalOpen(true)
  }

  const handleNewNotificationSubmit = (formData: {
    title: string
    message: string
    image: File | null
  }) => {
    console.log('New Notification Data:', formData)
    setIsNewNotificationModalOpen(false)
    // Optionally, add the new notification to the list of notifications
    setNotifications((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        content: formData.title,
        date: new Date().toLocaleString(),
        sentBy: 'You',
        status: 'Pending'
      }
    ])
  }

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md">
      <table className="min-w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="py-5 px-4"></th>
            <th className="py-5 px-4">Name, Username</th>
            <th className="py-5 px-4">Email</th>
            <th className="py-5 px-4">Mobile</th>
            <th className="py-5 px-4">Role</th>
            <th className="py-5 px-4">Gender</th>
            <th className="py-5">Status</th>
            <th className="py-5 px-1"></th>
          </tr>
        </thead>
        <tbody>
          {data?.map((customer) => (
            <tr key={customer.id} className="border-t hover:bg-gray-50 relative">
              <td className="py-5 ps-3 pe-2">
                <div className='bg-gray-200 py-2 px-2 text-4xl rounded-full justify-center flex items-center'>
                  {customer.firstname?.split('')[0]} {/* Extracts the first word */}
                </div>
              </td>
              <td className="py-5 px-4">
                <div>
                  <div className="font-semibold mb-2">{customer.firstname} {customer.lastname}</div>
                  <div className="text-sm text-gray-500"> ({customer.username})</div>
                </div>
              </td>
              <td className="py-5 px-4">{customer.email}</td>
              <td className="py-5 px-4">{customer.phoneNumber}</td>
              <td className="py-5 px-4">{customer.role}</td>
              <td className="py-5 px-4">{customer.gender}</td>
              <td className="py-5">
                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    customer.isVerified ===true
                      ? 'bg-green-900'
                      : customer.isVerified === false
                        ? 'bg-yellow-900'
                        : 'bg-red-900 '
                  }`}
                ></span>
              </td>
              <td className="text-right">
                <button
                  onClick={() => toggleMenu(customer.id)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none py-5 pe-5 "
                >
                  &#x22EE; {/* Vertical ellipsis */}
                </button>
                {activeMenu === customer.id && (
                  <div
                    className="absolute right-0 mt-2 bg-white rounded-md shadow-lg z-50"
                    style={{ width: '150px' }}
                  >
                    <button
                      onClick={() => navigate(`/customers/${customer.id}`)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      View Customer Details
                    </button>
                    <button
                      onClick={() => navigate(`/transaction-details/${customer.id}`)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      View Transaction Details
                    </button>
                    <button
                      onClick={() => setIsNotificationModalOpen(true)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Notification
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {/* <div className="flex justify-between items-center p-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg text-sm ${
            currentPage === 1
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg text-sm ${
            currentPage === totalPages
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Next
        </button>
      </div> */}

      {/* Notification History Modal */}
      {isNotificationModalOpen && (
        <NotificationHistoryModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          notifications={notifications}
          onNewNotification={handleNewNotificationClick}
        />
      )}

      {/* New Notification Modal */}
      {/* {isNewNotificationModalOpen && (
        <NewNotificationModal
          isOpen={isNewNotificationModalOpen}
          onClose={() => setIsNewNotificationModalOpen(false)}
          onSubmit={handleNewNotificationSubmit}
        />
      )} */}
    </div>
  )
}

export default UserTable
