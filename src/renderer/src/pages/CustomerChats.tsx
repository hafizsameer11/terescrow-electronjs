import React, { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import {
  getAllAgentToCusomterChats,
  type PaginatedChatsResponse,
  type ChatRow,
} from '@renderer/api/queries/admin.chat.queries'
import CustomerProfileTabs from '@renderer/components/CustomerProfileTabs'
import ChatTable from '@renderer/components/ChatTable'
import ListFetchingIndicator from '@renderer/components/ListFetchingIndicator'
import { useAuth } from '@renderer/context/authContext'
import { chatRowToAgentData } from '@renderer/utils/chatRowMapper'

const PAGE_SIZE = 50

const CustomerChats: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>()
  const { token } = useAuth()
  const [page, setPage] = useState(1)

  const {
    data: chatsResp,
    isLoading,
    isError,
    isFetching,
  } = useQuery<PaginatedChatsResponse>({
    queryKey: ['customer-chats', token, customerId, page],
    queryFn: () =>
      getAllAgentToCusomterChats({
        token: token!,
        page,
        limit: PAGE_SIZE,
        filters: { customerId: String(customerId) },
      }),
    enabled: !!token && !!customerId,
    placeholderData: keepPreviousData,
  })

  const rows: ChatRow[] = chatsResp?.data ?? []
  const tableRows = useMemo(() => rows.map(chatRowToAgentData), [rows])
  const total = chatsResp?.total ?? 0
  const totalPages = chatsResp?.totalPages ?? 1
  const initialLoad = isLoading && !chatsResp

  if (!customerId) {
    return <p className="text-red-600">Missing customer id</p>
  }

  return (
    <div className="w-full">
      <CustomerProfileTabs customerId={customerId} activeTab="chats" />

      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Previous chats</h1>
        <p className="text-sm text-gray-600 mt-1">
          Chat history for this customer ({total} total)
        </p>
      </div>

      {initialLoad ? (
        <p className="text-gray-600">Loading chats...</p>
      ) : isError ? (
        <p className="text-red-600">Failed to load chats</p>
      ) : (
        <>
          <ListFetchingIndicator show={isFetching && !initialLoad} />
          {tableRows.length === 0 ? (
            <p className="text-sm text-gray-500 py-8">No previous chats for this customer.</p>
          ) : (
            <ChatTable data={tableRows} isChat hubLayout disableInternalPagination />
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} / {totalPages} · {total} results
                {isFetching ? ' · updating…' : ''}
              </span>
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CustomerChats
