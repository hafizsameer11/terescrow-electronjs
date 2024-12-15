import React, { useState, useEffect } from 'react'
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai'
import NotificationFilters from './NotificationFilters'
import WelcomeModal from './WelcomeModal'
import AppBanner from './modal/AppBanner'
import NewNotificationModal from './modal/NewNotificationModal'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotification, getBanner, deleteNotification, deleteBanner } from '@renderer/api/queries/adminqueries'
import { token } from '@renderer/api/config'

const TransactionsTable: React.FC<{ textMsg: boolean; onTitleChange: (title: string) => void }> = ({
  textMsg,
  onTitleChange
}) => {
  const queryClient = useQueryClient()

  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [notificationType, setNotificationType] = useState<string>('Notification')
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [selectedBanner, setSelectedBanner] = useState<any>(null)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [isAppBannerOpen, setIsAppBannerOpen] = useState(false)

  // Fetch Notifications and Banners
  const { data: notificationsData, isLoading: loadingNotifications } = useQuery({
    queryKey: ['notificationsData'],
    queryFn: () => getNotification({ token }),
    enabled: !!token,
  })

  const { data: bannersData, isLoading: loadingBanners } = useQuery({
    queryKey: ['bannersData'],
    queryFn: () => getBanner({ token }),
    enabled: !!token,
  })

  // Delete Mutations
  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => queryClient.invalidateQueries(['notificationsData']),
  })

  const deleteBannerMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => queryClient.invalidateQueries(['bannersData']),
  })

  const handleDeleteNotification = (id: string) => {
    deleteNotificationMutation.mutate({ token, id })
  }

  const handleDeleteBanner = (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      deleteBannerMutation.mutate({ token, id })
    }
  }

  const handleOpenNotificationModal = (notification: any) => {
    setSelectedNotification(notification)
    setIsNotificationModalOpen(true)
  }

  const handleOpenBannerModal = (banner: any) => {
    setSelectedBanner(banner)
    setIsAppBannerOpen(true)
  }

  const handleCloseModals = () => {
    setIsNotificationModalOpen(false)
    setIsAppBannerOpen(false)
    setSelectedNotification(null)
    setSelectedBanner(null)
  }

  useEffect(() => {
    const title = notificationType === 'Notification' ? 'Notifications' : 'Banners'
    onTitleChange(title)
  }, [notificationType, onTitleChange])

  const filteredNotifications = notificationsData?.data || []
  const filteredBanners = bannersData?.data || []

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

      {/* Notifications Table */}
      {notificationType === 'Notification' && !loadingNotifications && (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2">Message</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotifications.map((notification: any) => (
              <tr key={notification.id} className="border-b">
                <td className="px-4 py-2">{notification.message}</td>
                <td className="px-4 py-2">{new Date(notification.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2">{notification.type}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    className="text-gray-500 bg-gray-100 p-2 rounded-lg"
                    onClick={() => handleOpenNotificationModal(notification)}
                  >
                    <AiOutlineEye size={20} />
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => handleDeleteNotification(notification.id)}
                  >
                    <AiOutlineDelete size={22} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Banners Table */}
      {notificationType === 'Banner' && !loadingBanners && (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2">Banner</th>
              <th className="px-4 py-2">Uploaded At</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBanners.map((banner: any) => (
              <tr key={banner.id} className="border-b">
                <td className="px-4 py-2">
                  <img src={banner.image} alt="Banner" className="w-32 h-20 object-cover rounded-md" />
                </td>
                <td className="px-4 py-2">{new Date(banner.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    className="text-gray-500 bg-gray-100 p-2 rounded-lg"
                    onClick={() => handleOpenBannerModal(banner)}
                  >
                    <AiOutlineEye size={20} />
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => handleDeleteBanner(banner.id)}
                  >
                    <AiOutlineDelete size={22} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modals */}
      <NewNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={handleCloseModals}
        actionType="edit"
        initialData={selectedNotification}
      />
      <AppBanner
        onSend={handleCloseModals}
        modalVisible={isAppBannerOpen}
        setModalVisible={setIsAppBannerOpen}
      />
    </div>
  )
}

export default TransactionsTable
