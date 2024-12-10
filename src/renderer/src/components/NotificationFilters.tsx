import React from 'react';

interface DeliveryOptionsFilterProps {
  deliveryOption: string;
  notificationType: string;
  onChange: (updatedDeliveryOption: string, updatedNotificationType: string) => void;
}

const NotificationFilters: React.FC<DeliveryOptionsFilterProps> = ({
  deliveryOption,
  notificationType,
  onChange,
}) => {
  const deliveryOptions = ['All', 'Delivered', 'Pending', 'Failed']; 
  const notificationTypes = ['Notification', 'Banner'];  

  return (
    <div className="flex items-center gap-4">
      {/* Delivery Option Buttons */}
      <div className="flex items-center">
        {deliveryOptions.map((option, index) => (
          <button
            key={option}
            className={`px-6 py-2 text-sm font-medium transition ${
              deliveryOption === option
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-300'
            } ${index === 0 ? 'rounded-l-lg' : 'border-l'} ${
              index === deliveryOptions.length - 1 ? 'rounded-r-lg' : ''
            } ${deliveryOption === option ? '' : 'border'}`}
            onClick={() => onChange(option, notificationType)} 
          >
            {option}
          </button>
        ))}
      </div>

      {/* Notification Type Buttons */}
      <div className="flex items-center">
        {notificationTypes.map((option, index) => (
          <button
            key={option}
            className={`px-6 py-2 text-sm font-medium transition ${
              notificationType === option
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-300'
            } ${index === 0 ? 'rounded-l-lg' : 'border-l'} ${
              index === notificationTypes.length - 1 ? 'rounded-r-lg' : ''
            } ${notificationType === option ? '' : 'border'}`}
            onClick={() => onChange(deliveryOption, option)} // Update only notificationType here
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NotificationFilters;
