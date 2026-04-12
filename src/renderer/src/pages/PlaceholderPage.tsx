import React from 'react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description = 'Coming soon.' }) => {
  return (
    <div className="w-full p-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-2">{title}</h1>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default PlaceholderPage;
