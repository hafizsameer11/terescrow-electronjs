import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai'
import { useState } from 'react'
import { Images } from '@renderer/constant/Image'
import WelcomeModal from './WelcomeModal'
import AppBanner from './modal/AppBanner'
import EditServicesModal from './modal/EditServicesModal'

interface ServicesTableProps {
  image: string
  title: string
  subtitle: string
  price: string
}

const data: ServicesTableProps[] = [
  {
    image: 'https://via.placeholder.com/150',
    title: 'Welcome to Tercesecrow',
    subtitle: 'Your number 1 hub for secure transactions.',
    price: 'Free'
  },
  {
    image: 'https://via.placeholder.com/150',
    title: 'Transaction Alert',
    subtitle: 'A new transaction has been successfully processed.',
    price: 'Free'
  },
  {
    image: 'https://via.placeholder.com/150',
    title: 'Payment Notification',
    subtitle: 'Your payment was received on Nov 8, 2024 - 11:22am.',
    price: 'Free'
  }
]

const ServicesTable = () => {
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false)
  const [isAppBannerOpen, setIsAppBannerOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const handleOpenEditModal = () => {
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
  }

  const handleOpenModal = () => {
    setIsWelcomeModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsWelcomeModalOpen(false)
    setIsAppBannerOpen(false)
  }
  return (
    <div>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2">Image</th>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Subtitle</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((transaction, index) => (
            <tr key={index} className="border-b">
              <td className="px-4 py-2">
                <img src={Images.tableImg} alt={transaction.title} className="object-cover" />
              </td>
              <td className="px-4 py-2">{transaction.title}</td>
              <td className="px-4 py-2">{transaction.subtitle}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  className="text-gray-500 bg-gray-100 p-2 rounded-lg"
                  onClick={handleOpenModal}
                >
                  <AiOutlineEye size={20} />
                </button>
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
      {isWelcomeModalOpen && <WelcomeModal onClose={handleCloseModal} />}
      {isAppBannerOpen && (
        <AppBanner
          onSend={handleCloseModal}
          modalVisible={isAppBannerOpen}
          setModalVisible={setIsAppBannerOpen}
        />
      )}

      {isEditModalOpen && (
        <EditServicesModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} />
      )}
    </div>
  )
}

export default ServicesTable
