import React from 'react';

interface NotificationBannerProps {
  message: string;
  icon?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({
  message,
  icon,
  backgroundColor = 'bg-yellow-100',
  textColor = 'text-yellow-800',
  borderColor = 'border-yellow-300',
}) => {
  return (
    <div
      className={`flex items-center space-x-3 ${backgroundColor} ${textColor} ${borderColor} border rounded-lg p-3`}
    >
      {icon && <div>{icon}</div>}
      <span className="text-sm">{message}</span>
    </div>
  );
};

export default NotificationBanner;
