import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAccountActivities } from '@renderer/api/queries/adminqueries'
import { useAuth } from '@renderer/context/authContext'

interface Activity {
  id: number
  description: string
  createdAt: string
}

interface PaginatedActivityPayload {
  data: Activity[]
  total: number
  page: number
  limit: number
  totalPages: number
}

function isPaginatedPayload(data: unknown): data is PaginatedActivityPayload {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    Array.isArray((data as PaginatedActivityPayload).data)
  )
}

interface TableProps {
  data?: Activity[]
  userId?: string
  itemsPerPage?: number
}

const ActivityTable: React.FC<TableProps> = ({ data: staticData, userId, itemsPerPage = 5 }) => {
  const { token } = useAuth()
  const [page, setPage] = useState(1)
  const [accumulated, setAccumulated] = useState<Activity[]>([])

  const { data: activityResponse, isLoading, isFetching } = useQuery({
    queryKey: ['accountActivityData', userId, page, itemsPerPage],
    queryFn: () => getAccountActivities({ token: token!, id: userId!, page, limit: itemsPerPage }),
    enabled: !!token && !!userId,
  })

  const payload = activityResponse?.data
  const pageRows: Activity[] = userId
    ? isPaginatedPayload(payload)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : []
    : []

  const totalPages = userId && isPaginatedPayload(payload) ? payload.totalPages : 1

  useEffect(() => {
    if (!userId) return
    if (page === 1) {
      setAccumulated(pageRows)
    } else if (pageRows.length > 0) {
      setAccumulated((prev) => {
        const ids = new Set(prev.map((a) => a.id))
        const next = pageRows.filter((a) => !ids.has(a.id))
        return [...prev, ...next]
      })
    }
  }, [userId, page, pageRows])

  useEffect(() => {
    setPage(1)
    setAccumulated([])
  }, [userId])

  const staticList = Array.isArray(staticData) ? staticData : []
  const [staticPage, setStaticPage] = useState(1)
  const staticTotalPages = Math.max(1, Math.ceil(staticList.length / itemsPerPage))
  const staticSlice = staticList.slice(
    (staticPage - 1) * itemsPerPage,
    staticPage * itemsPerPage
  )

  const displayData = userId ? accumulated : staticSlice

  if (userId && isLoading && page === 1) {
    return <p className="px-4 py-6 text-gray-500 text-sm">Loading activities…</p>
  }

  return (
    <div className="bg-white rounded-lg">
      <h2 className="text-lg font-semibold px-4 pt-4">Activities</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b text-gray-600">
            <th className="py-4 px-4">Description</th>
            <th className="py-4 px-4 text-right">Date</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((activity) => (
            <tr key={activity.id} className="border-b hover:bg-gray-100">
              <td className="py-4 px-4">{activity.description}</td>
              <td className="py-4 px-4 text-right">{activity.createdAt.split('T')[0]}</td>
            </tr>
          ))}
          {displayData.length === 0 && (
            <tr>
              <td colSpan={2} className="py-6 px-4 text-center text-gray-500 text-sm">
                No activities found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {userId && page < totalPages && (
        <div className="flex justify-center px-4 py-4">
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={isFetching}
            className="px-6 py-2 rounded-lg bg-[#147341] text-white text-sm font-medium hover:bg-[#0d5a2e] disabled:opacity-50"
          >
            {isFetching ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {!userId && staticList.length > itemsPerPage && (
        <div className="flex justify-between items-center px-4 py-4">
          <button
            type="button"
            onClick={() => setStaticPage((p) => Math.max(1, p - 1))}
            disabled={staticPage === 1}
            className="px-4 py-2 rounded bg-gray-200 text-gray-600 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600 text-sm">Page {staticPage} of {staticTotalPages}</span>
          <button
            type="button"
            onClick={() => setStaticPage((p) => Math.min(staticTotalPages, p + 1))}
            disabled={staticPage === staticTotalPages}
            className="px-4 py-2 rounded bg-[#147341] text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default ActivityTable
