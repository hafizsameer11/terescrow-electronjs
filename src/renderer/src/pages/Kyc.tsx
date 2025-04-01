import { getAllKycRequests } from '@renderer/api/queries/adminqueries'
import CustomerTable from '@renderer/components/CustomerTable'
import KycLimitsTable from '@renderer/components/KycModalTable'
import { useAuth } from '@renderer/context/authContext'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect } from 'react'

const Kyc = () => {
  const { token } = useAuth()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['kycUsers'],
    queryFn: () => getAllKycRequests({ token }),
    enabled: !!token,
  })

  useEffect(() => {
    console.log('KYC Data:', data?.data)
  }, [data])

  return (
    <div className='w-full'>
      <h1 className='text-2xl font-semibold text-gray-800'>KYC Limits</h1>
      <KycLimitsTable />

      <h1 className='text-2xl font-semibold text-gray-800'>KYC Requests</h1>

      {isLoading && <p className="text-gray-600">Loading KYC Requests...</p>}
      {isError && <p className="text-red-500">Error: {error?.message || 'Failed to load data'}</p>}

      {!isLoading && !isError && data?.data && (
        <CustomerTable data={data.data} />
      )}
    </div>
  )
}

export default Kyc
