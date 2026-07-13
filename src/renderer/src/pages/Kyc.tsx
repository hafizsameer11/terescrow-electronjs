import { getAllKycRequests } from '@renderer/api/queries/adminqueries'
import KycLimitsTable from '@renderer/components/KycModalTable'
import KycRequestsTable from '@renderer/components/KycRequestsTable'
import { useAuth } from '@renderer/context/authContext'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

const Kyc = () => {
  const { token } = useAuth()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['kycUsers'],
    queryFn: () => getAllKycRequests({ token }),
    enabled: !!token,
  })

  const kycUsers = Array.isArray(data?.data) ? data.data : []

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-gray-800">KYC Limits</h1>
      <KycLimitsTable />

      <h1 className="text-2xl font-semibold text-gray-800 mt-8">KYC Requests</h1>
      <p className="text-gray-600 text-sm mb-4">Pending KYC submissions awaiting review</p>

      {isLoading && <p className="text-gray-600">Loading KYC Requests...</p>}
      {isError && <p className="text-red-500">Error: {error?.message || 'Failed to load data'}</p>}

      {!isLoading && !isError && (
        <KycRequestsTable data={kycUsers} />
      )}
    </div>
  )
}

export default Kyc
