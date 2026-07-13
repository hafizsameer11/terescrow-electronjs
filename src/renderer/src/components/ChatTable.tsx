import React, { useState, useMemo, useEffect } from 'react'
// import ChatApplication from '../ChatApplication';
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai'
import { FiMoreVertical } from 'react-icons/fi'
import TeamChat from './TeamChat'
import ChatApplication from './ChatApplication'
import { AgentToAgentChatData, AgentToCustomerChatData } from '@renderer/api/queries/datainterfaces'
import { getImageUrl, formatNairaAmount } from '@renderer/api/helper'
import AdminChatApplication from './AdminChatApplication'
import AdminChatApplicationTeam from './AdminChatApplicationTeam'
import { useAuth } from '@renderer/context/authContext'
// import TeamChat from '../TeamChat';

function countryEmoji(country?: string): string {
  if (!country) return ''
  const u = country.trim().toUpperCase()
  if (u === 'NG' || u.includes('NIGERIA')) return '🇳🇬'
  if (u === 'US' || u === 'USA') return '🇺🇸'
  if (u === 'GB' || u === 'UK') return '🇬🇧'
  if (u.length === 2) {
    try {
      const A = 0x1f1e6
      const pts = [...u].map((c) => A + (c.charCodeAt(0) - 65))
      return String.fromCodePoint(...pts)
    } catch {
      return ''
    }
  }
  return ''
}

function statusLabel(status: string): string {
  const s = (status || '').toLowerCase()
  if (s === 'successful') return 'Successful'
  if (s === 'processing') return 'Processing'
  if (s === 'declined') return 'Declined'
  if (s === 'pending') return 'Pending'
  if (s === 'unsucessful' || s === 'unsuccessful') return 'Unanswered'
  return status || '—'
}

function statusBadgeClass(status: string): { wrap: string; dot: string } {
  const s = (status || '').toLowerCase()
  if (s === 'successful') return { wrap: 'bg-green-100 text-green-800', dot: 'bg-green-600' }
  if (s === 'declined') return { wrap: 'bg-red-100 text-red-800', dot: 'bg-red-600' }
  if (s === 'pending') return { wrap: 'bg-amber-100 text-amber-900', dot: 'bg-amber-500' }
  if (s === 'processing') return { wrap: 'bg-blue-100 text-blue-800', dot: 'bg-blue-600' }
  if (s === 'unsucessful' || s === 'unsuccessful') return { wrap: 'bg-gray-100 text-gray-600', dot: 'bg-gray-500' }
  return { wrap: 'bg-pink-100 text-pink-800', dot: 'bg-pink-600' }
}

function formatListDate(iso?: string | null): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso.split('T')[0] ?? '—'
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

const CHAT_PREVIEW_MAX_CHARS = 72

function truncateChatPreview(text: string, max = CHAT_PREVIEW_MAX_CHARS): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max).trimEnd()}…`
}

interface Transaction {
  id: number
  name: string
  username: string
  status: string
  serviceType?: string
  transactionType?: string
  date?: string
  amount?: string
  dateAdded?: string
  role?: string
}

interface TransactionsTableProps {
  data: AgentToCustomerChatData[] | undefined
  teamData?: AgentToAgentChatData[] | undefined
  isChat?: boolean
  isTeam?: boolean
  onEditHanlder?: (agentId: number) => void
  userViewState?: boolean
  onUserViewed?: (selectedId: number) => void
  isTeamCommunition?: boolean
  activeFilterInTeam?: string
  /** Chats hub: checkboxes, status copy, flags, no per-table pagination (use parent pager). */
  hubLayout?: boolean
  disableInternalPagination?: boolean
  // teamData: AgentToCustomerChatData[]
}

const ChatTable: React.FC<TransactionsTableProps> = ({
  data,
  teamData,
  isChat = false,
  isTeam = false,
  onEditHanlder,
  isTeamCommunition = true,
  onUserViewed,
  activeFilterInTeam = 'Customer',
  hubLayout = false,
  disableInternalPagination = false,
}) => {
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const [activeChatId, setActiveChatId] = useState<number | null>(null); // Track the active chat ID
  const [currentItem, setCurrentItem] = useState<AgentToCustomerChatData | null>(null);
  const [currentItem2, setCurrentItem2] = useState<AgentToAgentChatData | null>(null);
  const { userData } = useAuth();
  const toggleMenu = (id: number) => {
    setActiveMenu(activeMenu === id ? null : id)
  }

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isTeamChatOpen, setIsTeamChatOpen] = useState(false)
  const [teamModal, setTeamModal] = useState(false)
  // const [teamchat, setTeamChat] = useState<AgentToAgentChatData | null>(null)
  const handleeyeclick = (id: number, item: AgentToCustomerChatData) => {
    console.log(id)
    setCurrentItem(item)
    setActiveChatId(id)
    setIsChatOpen(true)
  }
  const handlesecondEyeClick = (id: number, item: AgentToAgentChatData) => {
    setCurrentItem2(item)
    setTeamModal(true)
    setActiveChatId(id)
    setIsTeamChatOpen(true)
  }
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const len = data?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(len / itemsPerPage));
  const paginatedData = useMemo(() => {
    if (disableInternalPagination || hubLayout) return data ?? [];
    return data?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) ?? [];
  }, [data, currentPage, disableInternalPagination, hubLayout]);
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const allOnPageSelected =
    hubLayout &&
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedIds.has(row.id));
  const toggleSelectAllOnPage = () => {
    if (!hubLayout) return;
    if (allOnPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedData.forEach((row) => next.delete(row.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedData.forEach((row) => next.add(row.id));
        return next;
      });
    }
  };

  useEffect(() => {
    if (activeMenu == null) return;
    const onDoc = () => setActiveMenu(null);
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [activeMenu]);

  if (activeFilterInTeam === 'Customer') {
    const chatModal =
      isTeamCommunition && isChatOpen ? (
        <div className="fixed inset-0 bg-gray-900/50 flex justify-center items-center z-[100] p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-xl shadow-xl relative overflow-y-auto">
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10"
              onClick={() => setIsChatOpen(false)}
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {userData?.role !== 'agent' ? (
              currentItem ? (
                <AdminChatApplication data={currentItem} id={activeChatId || 0} onClose={() => setIsChatOpen(false)} isAdmin={true} />
              ) : (
                <div className="p-6 text-center">Loading chat data...</div>
              )
            ) : currentItem ? (
              <ChatApplication data={currentItem} id={activeChatId || 0} onClose={() => setIsChatOpen(false)} />
            ) : (
              <div className="p-6 text-center">Loading chat data...</div>
            )}
          </div>
        </div>
      ) : null;

    return (
      <>
        <div
          className={`mt-6 bg-white ${hubLayout ? 'rounded-xl border border-gray-200 shadow-sm overflow-hidden' : 'rounded-lg shadow-md'}`}
        >
          <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left text-sm text-gray-700">
            <thead
              className={
                hubLayout
                  ? 'bg-white text-gray-500 text-xs font-medium border-b border-gray-200'
                  : 'bg-gray-100 text-gray-600 uppercase text-xs'
              }
            >
              <tr>
                {hubLayout ? (
                  <th className="py-3 pl-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-400"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAllOnPage}
                      aria-label="Select all on page"
                    />
                  </th>
                ) : (
                  <th className="py-3 w-[5%]" />
                )}
                <th className="py-3 px-4 w-[26%] max-w-0">Name, Chat</th>
                {activeFilterInTeam === 'Customer' && <th className="py-3 px-4 w-[14%]">Amount</th>}
                {activeFilterInTeam === 'Customer' && <th className="py-3 px-4 w-[14%]">Agent</th>}
                <th className="py-3 px-4 w-[16%]">Date</th>
                {activeFilterInTeam === 'Customer' && <th className="py-3 px-4 w-[14%]">Status</th>}
                <th className="py-3 px-4 text-center w-[12%]">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData?.map((item) => {
                const msg =
                  typeof item.recentMessage?.message === 'string' && item.recentMessage.message.trim()
                    ? item.recentMessage.message.trim()
                    : 'Sent an image';
                const amt = item?.transactions?.[0]?.amount;
                const ngn = item?.transactions?.[0]?.amountNaira;
                const amtUsd =
                  amt != null && amt !== ''
                    ? typeof amt === 'number'
                      ? `$${amt}`
                      : String(amt).startsWith('$')
                        ? String(amt)
                        : `$${amt}`
                    : '—';
                const initial =
                  (item.customer.country && item.customer.country.length >= 2
                    ? item.customer.country.slice(0, 1)
                    : item.customer.firstname?.[0]) || '?';
                const emoji = countryEmoji(item.customer.country);

                return (
                  <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50/80 relative">
                    {hubLayout ? (
                      <td className="py-3 pl-4 align-middle">
                        <input
                          type="checkbox"
                          className="rounded border-gray-400"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          aria-label="Select row"
                        />
                      </td>
                    ) : (
                      <td className="py-3 ps-5">
                        <div className="rounded-full inline-flex overflow-hidden w-10 h-10">
                          <img src={getImageUrl(item.customer.profilePicture)} alt="" className="w-full h-full object-cover" />
                        </div>
                      </td>
                    )}
                    <td className="py-3 px-4 max-w-0 overflow-hidden">
                      <div className={`flex gap-3 min-w-0 ${hubLayout ? 'items-start' : ''}`}>
                        {hubLayout && (
                          <div className="rounded-full overflow-hidden w-10 h-10 shrink-0">
                            <img src={getImageUrl(item.customer.profilePicture)} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-gray-900">
                              {item.customer.firstname} {item.customer.lastname}
                            </span>
                            {!hubLayout && <span className="font-medium text-gray-800">{item.customer.username}</span>}
                            {hubLayout && emoji ? <span className="text-base leading-none">{emoji}</span> : null}
                            {hubLayout ? (
                              <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                {initial.toUpperCase()}
                              </span>
                            ) : null}
                            {(item as { unreadCount?: number }).unreadCount != null &&
                            (item as { unreadCount?: number }).unreadCount! > 0 ? (
                              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-bold text-white bg-red-600 rounded-full">
                                {(item as { unreadCount?: number }).unreadCount}
                              </span>
                            ) : null}
                          </div>
                          <p
                            className="text-sm text-gray-500 m-0 mt-0.5 truncate"
                            title={msg}
                          >
                            {truncateChatPreview(msg)}
                          </p>
                        </div>
                      </div>
                    </td>
                    {activeFilterInTeam === 'Customer' && (
                      <td className="py-3 px-4 align-top">
                        <span className="block font-semibold text-gray-900">{amtUsd}</span>
                        <span className="text-sm text-gray-400">NGN {formatNairaAmount(ngn ?? 0)}</span>
                      </td>
                    )}
                    {activeFilterInTeam === 'Customer' && (
                      <td className="py-3 px-4 text-gray-800">
                        {item.agent.firstname} {item.agent.lastname}
                      </td>
                    )}
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {formatListDate(item.recentMessage?.createdAt ?? null)}
                    </td>
                    {activeFilterInTeam === 'Customer' && (
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full border-0 ${statusBadgeClass(item.chatStatus).wrap}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusBadgeClass(item.chatStatus).dot}`}
                          />
                          {statusLabel(item.chatStatus)}
                        </span>
                      </td>
                    )}
                    <td className="py-3 px-4 relative">
                      <div className="flex justify-center items-center gap-4">
                        <button
                          type="button"
                          className="text-gray-500 hover:text-[#147341] focus:outline-none p-1"
                          onClick={() => handleeyeclick(item.id, item)}
                          aria-label="View chat"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 3C7.5 3 3.75 7.03 2.25 12c1.5 4.97 5.25 9 9.75 9s8.25-4.03 9.75-9C20.25 7.03 16.5 3 12 3zM12 15a3 3 0 100-6 3 3 0 000 6z"
                            />
                          </svg>
                        </button>
                        <div className="relative">
                          <button
                            type="button"
                            className="text-gray-500 hover:text-gray-800 p-1"
                            aria-label="More"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMenu(item.id);
                            }}
                          >
                            <FiMoreVertical className="w-5 h-5" />
                          </button>
                          {activeMenu === item.id ? (
                            <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1">
                              <button
                                type="button"
                                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => {
                                  handleeyeclick(item.id, item);
                                  setActiveMenu(null);
                                }}
                              >
                                Open chat
                              </button>
                              <button
                                type="button"
                                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setActiveMenu(null)}
                              >
                                Dismiss
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          {!disableInternalPagination && !hubLayout ? (
            <div className="flex justify-between items-center p-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg text-sm ${
                  currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg text-sm ${
                  currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
        {chatModal}
      </>
    );
  }

  if (activeFilterInTeam === 'Team') {
    // Render Team Members Table
    return (
      <div className="mt-6 bg-white rounded-lg shadow-md">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="py-3 px-4">Name, Username</th>
              <th className="py-3 px-4">Recent Message</th>
              <th className="py-3 px-4">Date Added</th>
              {/* <th className="py-3 px-4">Role</th> */}
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {teamData?.map((member) => (
              <tr key={member.id} className="border-t hover:bg-gray-50">
                {/* Name and Username */}
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-gray-800">{member.otherParticipants[0].user.firstname}</span>
                      <p className="m-0 text-sm text-gray-500">{member.otherParticipants[0].user.username}</p>
                    </div>
                    <span
                      className={`w-3 h-3 rounded-full mb-4 ${member.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                    ></span>
                  </div>
                </td>
                <td className="py-3 px-4 max-w-0 overflow-hidden">
                  <span className="block truncate" title={member?.recentMessage.message}>
                    {truncateChatPreview(member?.recentMessage.message ?? '—')}
                  </span>
                </td>
                <td className="py-3 px-4">{member.recentMessageTimestamp.split('T')[0]}</td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center space-x-2">
                    <button
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      onClick={() =>
                        handlesecondEyeClick(member.id, member as AgentToAgentChatData)
                      }
                    >
                      <AiOutlineEye className="text-gray-700 w-5 h-5" />
                    </button>
                    <button
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      onClick={() => onEditHanlder && onEditHanlder(member.id)}
                    >
                      <AiOutlineEdit className="text-gray-700 w-5 h-5" />
                    </button>
                    <button
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      onClick={() => console.log('Delete', member.id)}
                    >
                      <AiOutlineDelete className="text-red-500 w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Chat Application */}
        {teamModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg relative">
              {/* Close Button */}
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setIsChatOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <AdminChatApplicationTeam
                data={currentItem2}
                id={activeChatId || 0}
                onClose={() => setTeamModal(false)}
                isAdmin={true}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

}

export default ChatTable
