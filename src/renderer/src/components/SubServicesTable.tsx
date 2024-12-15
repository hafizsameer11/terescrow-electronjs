import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai'
import { useState } from 'react'
import AppBanner from './modal/AppBanner'
import EditSubServicesModal from './modal/EditSubServicesModal'
import { useQuery } from '@tanstack/react-query'
import { getCategories, getSubCategories } from '@renderer/api/queries/adminqueries'
import { token } from '@renderer/api/config'
// import EditServicesModal from './modal/EditServicesModal'
// import EditSubServicesModal from './modal/EditSubServicesModal'
// import EditServicesModal from './modal/EditServicesModal'
// import EditServicesModal from './modal/EditSubServicesModal'
interface ServicesTableProps {
  title: string
  subtitle: string
  price: string
}

const data: ServicesTableProps[] = [
  {
    title: 'Welcome to Tercesecrow',
    subtitle: 'Your number 1 hub for secure transactions.',
    price: 'Free'
  },
  {
    title: 'Transaction Alert',
    subtitle: 'A new transaction has been successfully processed.',
    price: 'Free'
  },
  {
    title: 'Payment Notification',
    subtitle: 'Your payment was received on Nov 8, 2024 - 11:22am.',
    price: 'Free'
  }
]

const SubServicesTable = () => {
  const [isAppBannerOpen, setIsAppBannerOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const handleOpenEditModal = () => {
    setIsEditModalOpen(true)
  }
  const { data: subcategories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['subcategories'],
    queryFn: () => getSubCategories({ token }),
    enabled: !!token,
  })
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
  }

  const handleCloseModal = () => {
    setIsAppBannerOpen(false)
  }
  return (
    <div>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {subcategories?.data.map((transaction, index) => (
            <tr key={index} className="border-b">
              <td className="px-4 py-2">
                <td className="px-4 py-2">{transaction.price}</td>
              </td>
              <td className="px-4 py-2">{transaction.title}</td>

              <td className="px-4 py-2 space-x-2">
                <button
                  className="text-gray-500 bg-gray-100 p-2 rounded-lg"
                  onClick={handleOpenEditModal}
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
      {isAppBannerOpen && (
        <AppBanner
          onSend={handleCloseModal}
          modalVisible={isAppBannerOpen}
          setModalVisible={setIsAppBannerOpen}
        />
      )}

      {isEditModalOpen && (
        <EditSubServicesModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} />
      )}
    </div>
  )
}

export default SubServicesTable
