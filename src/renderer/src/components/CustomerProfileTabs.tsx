import React from 'react'
import { useNavigate } from 'react-router-dom'

export type CustomerProfileTab = 'details' | 'transactions' | 'chats'

const TABS: { id: CustomerProfileTab; label: string; path: (id: string) => string }[] = [
  {
    id: 'details',
    label: 'Customer details and activities',
    path: (id) => `/customers/${id}`,
  },
  {
    id: 'transactions',
    label: 'Transaction activities and balance',
    path: (id) => `/transaction-details/${id}`,
  },
  {
    id: 'chats',
    label: 'Previous chats',
    path: (id) => `/customer-chats/${id}`,
  },
]

interface CustomerProfileTabsProps {
  customerId: string
  activeTab: CustomerProfileTab
}

const CustomerProfileTabs: React.FC<CustomerProfileTabsProps> = ({ customerId, activeTab }) => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => navigate(tab.path(customerId))}
          className={`px-4 py-2 rounded-md shadow-sm ${
            activeTab === tab.id
              ? 'bg-[#147341] text-white'
              : 'text-gray-700 border border-gray-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default CustomerProfileTabs
