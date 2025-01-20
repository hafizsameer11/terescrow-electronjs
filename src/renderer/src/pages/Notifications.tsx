import { useEffect, useState } from 'react';
import TransactionsTable from '@renderer/components/NotificationTable';
import NewNotificationModal from '@renderer/components/modal/NewNotificationModal';
import NewBannerModal from '@renderer/components/modal/NewBannerModal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { createBanner, getCustomerNotifications, getTeamNotifications } from '@renderer/api/queries';
import { useAuth } from '@renderer/context/authContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCustomerNotifications, getTeamNotifications } from '@renderer/api/queries/commonqueries';
import { createBanner } from '@renderer/api/queries/adminqueries';

interface Notification {
  type: 'Team' | 'Customer';
  message: string;
  time: string;
  isImportant?: boolean;
}

const Notifications = () => {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [title, setTitle] = useState<string>('Notifications');
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false); // State for NewBannerModal
  const [activeOption, setActiveOption] = useState<'Notifications' | 'In-App Notification'>(
    'Notifications'
  );
  const [state, setState] = useState<'Default' | 'Banner'>('Default');

  const queryClient = useQueryClient();
  const { token, userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract and update state and tab from query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    const stateParam = searchParams.get('state');

    if (tab) {
      setActiveOption(tab as 'Notifications' | 'In-App Notification');
    }
    if (stateParam) {
      setState(stateParam as 'Default' | 'Banner');
    }
  }, [location.search]);

  const {
    data: teamNotifications,
    isLoading: teamNotificationsLoading,
  } = useQuery({
    queryKey: ['teamnotifications'],
    refetchInterval: 3000,
    queryFn: () => getTeamNotifications(token),
  });

  const {
    data: customerNotifications,
    isLoading: customerNotificationsLoading,
  } = useQuery({
    queryKey: ['customernotifications'],
    refetchInterval: 3000,
    queryFn: () => getCustomerNotifications(token),
  });

  const { mutate: uploadBanner } = useMutation({
    mutationFn: async (file: File | null) => {
      if (!file) throw new Error('No file selected');
      const formData = new FormData();
      formData.append('image', file);
      return createBanner({ token, data: formData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['banners']);
      alert('Banner uploaded successfully!');
      setIsBannerModalOpen(false);
    },
    onError: (error) => {
      console.error('Failed to upload banner:', error);
    },
  });

  const handleSendBanner = (file: File | null) => {
    uploadBanner(file);
  };

  const handleOpenNotificationModal = () => {
    setIsNotificationModalOpen(true);
  };

  const handleCloseNotificationModal = () => {
    setIsNotificationModalOpen(false);
  };

  const handleOpenBannerModal = () => {
    setIsBannerModalOpen(true);
  };

  const handleOptionChange = (option: 'Notifications' | 'In-App Notification') => {
    setActiveOption(option);
    const searchParams = new URLSearchParams(location.search);

    if (option === 'Notifications') {
      searchParams.delete('tab');
      searchParams.delete('state');
    } else {
      searchParams.set('tab', 'In-App Notification');
      searchParams.set('state', state); // Retain the current state
    }
    navigate(`/notifications?${searchParams.toString()}`, { replace: true });
  };

  const titleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  return (
    <div className="w-full">
      <div className="flex mb-5 justify-between">
        <div className="flex">
          <h1 className="text-[40px] text-gray-800 pr-6">{title}</h1>
          {title === 'Notifications' && (
            <div className="flex">
              <button
                onClick={() => handleOptionChange('Notifications')}
                className={`px-4 py-2 rounded-lg font-medium ${activeOption === 'Notifications'
                  ? 'text-white bg-green-700'
                  : 'text-gray-800 border border-gray-300'
                  }`}
              >
                Notifications
              </button>
              {userData?.role === 'admin' && (


                <button
                  onClick={() => handleOptionChange('In-App Notification')}
                  className={`px-4 py-2 rounded-lg font-medium ${activeOption === 'In-App Notification'
                    ? 'text-white bg-green-700'
                    : 'text-gray-800 border border-gray-300'
                    }`}
                >
                  In-App Notification
                </button>
              )}
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
        <div className="w-full p-6">
          <div className="flex gap-6">
            <div className="border bg-white rounded-md w-1/2 p-8 shadow-md">
              <h2 className="font-bold text-lg mb-4">Team Notification</h2>
              {teamNotifications?.data?.map((notification, index) => (
                <div key={index} className="py-2">
                  <p>
                    <span className="font-bold">{notification.description}</span>
                  </p>
                  <p className="text-gray-500 pt-2 text-sm">
                    {notification.createdAt.split('T')[0]}
                  </p>
                </div>
              ))}
            </div>

            <div className="border bg-white rounded-md p-8 w-1/2 shadow-md">
              <h2 className="font-bold text-lg mb-4">Customer Notification</h2>
              {customerNotifications?.data?.map((notification, index) => (
                <div key={index} className="py-2">
                  <span>
                    <span className="font-bold">{notification.description}</span>
                  </span>
                  <p className="text-gray-500 text-sm pt-2">
                    {notification.createdAt.split('T')[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeOption === 'In-App Notification' && (
        <div>
          <TransactionsTable textMsg={true} onTitleChange={titleChange} isBanner={state === 'Banner'} notificationTyp={state} />
        </div>
      )}

      <NewNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={handleCloseNotificationModal}
        onSubmit={handleCloseNotificationModal}
        actionType="add"
      />

      <NewBannerModal
        modalVisible={isBannerModalOpen}
        setModalVisible={setIsBannerModalOpen}
        onSend={handleSendBanner}
      />
    </div>
  );
};

export default Notifications;
