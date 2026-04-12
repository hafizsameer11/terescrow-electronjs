import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiCalendar } from 'react-icons/fi';
import { useAuth } from '@renderer/context/authContext';
import {
  getAllAgentToCusomterChats,
  getChatStats,
  getTeamStats,
  getTransactionStats,
  getDashBoardStats,
  PaginatedChatsResponse,
  ChatRow,
} from '@renderer/api/queries/admin.chat.queries';
import { getAllAgentss } from '@renderer/api/queries/adminqueries';
import {
  dailyReportCheckIn,
  dailyReportCheckOut,
  getDailyReportShiftSettings,
  type ShiftType,
} from '@renderer/api/admin/dailyReport';
import CheckInModal from '@renderer/components/modal/CheckInModal';
import ChatFilters from '@renderer/components/ChatFilters';
import ChatTable from '@renderer/components/ChatTable';
import type { AgentToCustomerChatData } from '@renderer/api/queries/datainterfaces';
import { getImageUrl, formatNairaAmount } from '@renderer/api/helper';

const PAGE_SIZE = 50;

type UIFilters = {
  status: string;
  type: string;
  dateRange: 'Last 7 days' | 'Last 15 days' | 'Last 30 days' | 'All';
  search: string;
  transactionType: string;
  category: string;
  startDate: string;
  endDate: string;
};

const computeStartFromPreset = (label: UIFilters['dateRange']): string | undefined => {
  if (label === 'All') return undefined;
  const now = new Date();
  const d = new Date(now);
  if (label === 'Last 7 days') d.setDate(now.getDate() - 7);
  else if (label === 'Last 15 days') d.setDate(now.getDate() - 15);
  else if (label === 'Last 30 days') d.setDate(now.getDate() - 30);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

function numId(v: string | number | undefined): number {
  if (v == null) return 0;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function chatRowToAgentData(row: ChatRow): AgentToCustomerChatData {
  const c = row.customer;
  const a = row.agent;
  return {
    id: numId(row.id),
    customer: {
      id: numId(c?.id),
      username: c?.username ?? '—',
      firstname: c?.firstname ?? '',
      lastname: c?.lastname ?? '',
      role: c?.role ?? 'customer',
      profilePicture: c?.profilePicture ?? '',
      country: c?.country ?? '',
    },
    recentMessage: row.recentMessage
      ? {
          id: numId(row.recentMessage.id),
          message: row.recentMessage.message ?? '',
          createdAt: row.recentMessage.createdAt ?? '',
        }
      : null,
    recentMessageTimestamp: row.recentMessage?.createdAt ?? null,
    chatStatus: row.chatStatus ?? 'pending',
    department: { id: 0, title: '', Type: '', niche: '' },
    messagesCount: 0,
    transactions: [],
    agent: {
      id: numId(a?.id),
      username: a?.username ?? '',
      firstname: a?.firstname ?? '',
      lastname: a?.lastname ?? '',
      role: a?.role ?? '',
      profilePicture: a?.profilePicture ?? '',
    },
    createdAt: row.createdAt ?? '',
  };
}

function formatInputDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

const Chat = () => {
  const { token, userData } = useAuth();
  const queryClient = useQueryClient();
  const [checkInOpen, setCheckInOpen] = useState(false);

  const [filters, setFilters] = useState<UIFilters>({
    status: 'All',
    type: 'buy',
    dateRange: 'Last 30 days',
    search: '',
    transactionType: 'buy',
    category: 'All',
    startDate: '',
    endDate: '',
  });

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: chatStatsData } = useQuery({
    queryKey: ['chatStats', token],
    queryFn: () => getChatStats({ token: token! }),
    enabled: !!token,
  });

  const { data: teamStats } = useQuery({
    queryKey: ['teamStats', token],
    queryFn: () => getTeamStats({ token: token! }),
    enabled: !!token,
  });

  const { data: agentsList } = useQuery({
    queryKey: ['all-agents-chat-page'],
    queryFn: () => getAllAgentss({ token: token! }),
    enabled: !!token,
  });

  const { data: txStats } = useQuery({
    queryKey: ['transactionStats', token],
    queryFn: () => getTransactionStats({ token: token! }),
    enabled: !!token,
  });

  const { data: dashStats } = useQuery({
    queryKey: ['dashboardStats', token],
    queryFn: () => getDashBoardStats({ token: token! }),
    enabled: !!token,
  });

  const { data: shiftSettings } = useQuery({
    queryKey: ['daily-report-shift-chat'],
    queryFn: () => getDailyReportShiftSettings(token!),
    enabled: !!token && checkInOpen,
  });

  const checkInMutation = useMutation({
    mutationFn: (shift: ShiftType) => dailyReportCheckIn(token!, { shift }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-daily-report-logs'] });
      setCheckInOpen(false);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: () => dailyReportCheckOut(token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-daily-report-logs'] });
    },
  });

  const backendFilters = useMemo(() => {
    const out: Record<string, string | undefined> = {};
    if (filters.status !== 'All') out.status = filters.status;
    if (filters.type !== 'All') out.type = filters.type;
    if (filters.category !== 'All') out.category = filters.category;

    const presetStart = computeStartFromPreset(filters.dateRange);
    const start = filters.startDate || presetStart || undefined;
    const end = filters.endDate || undefined;

    if (start) out.start = start;
    if (end) out.end = end;

    if (filters.search.trim()) out.q = filters.search.trim();
    return out;
  }, [filters]);

  const {
    data: chatsResp,
    isLoading: chatLoading,
    isError: chatIsError,
    error: chatError,
    isFetching,
  } = useQuery<PaginatedChatsResponse>({
    queryKey: ['chats', token, page, backendFilters],
    queryFn: () =>
      getAllAgentToCusomterChats({
        token: token!,
        page,
        limit: PAGE_SIZE,
        filters: backendFilters,
      }),
    enabled: !!token,
    keepPreviousData: true,
  });

  const rows: ChatRow[] = chatsResp?.data ?? [];
  const tableRows = useMemo(() => rows.map(chatRowToAgentData), [rows]);
  const total = chatsResp?.total ?? 0;
  const totalPages = chatsResp?.totalPages ?? 1;

  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.type, filters.category, filters.startDate, filters.endDate, filters.dateRange]);

  const stats = chatStatsData?.data;

  const cryptoNgn = txStats?.data?.cryptoTransactions?._sum?.amountNaira ?? 0;
  const giftNgn = txStats?.data?.giftCardTransactions?._sum?.amountNaira ?? 0;
  const billNgn = Math.max(
    0,
    (txStats?.data?.totalTransactionAmountSum?._sum?.amountNaira ?? 0) - cryptoNgn - giftNgn
  );
  const earnRaw = dashStats?.data?.totalRevenue?.current ?? 0;
  const earnNegative = dashStats?.data?.totalRevenue?.change === 'negative';

  const agentAvatars = agentsList?.data?.slice(0, 4) ?? [];
  const onlineTotal = teamStats?.data?.totalOnlineAgents ?? agentAvatars.length;
  const plusMore = Math.max(0, onlineTotal - agentAvatars.length);

  const displayName = [userData?.firstname, userData?.lastname].filter(Boolean).join(' ') || userData?.username || 'User';

  return (
    <>
      <div className="p-6 space-y-8 w-full max-w-[1600px] mx-auto">
        {/* Top bar row */}
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
          <h1 className="text-[40px] text-gray-800 font-normal shrink-0">Chats</h1>

          <div className="flex flex-wrap items-center gap-4 xl:gap-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCheckInOpen(true)}
                className="px-6 py-2.5 rounded-lg bg-[#147341] text-white text-sm font-medium hover:bg-[#0d5a2e] shadow-sm"
              >
                Clock In
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clock out now?')) checkOutMutation.mutate();
                }}
                disabled={checkOutMutation.isPending}
                className="px-6 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 shadow-sm disabled:opacity-50"
              >
                Clock Out
              </button>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col gap-1 text-xs text-gray-600">
                Start Date
                <div className="relative">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="pl-3 pr-9 py-2 rounded-lg border border-gray-300 text-sm text-gray-800 min-w-[160px]"
                  />
                  <FiCalendar className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                </div>
                {filters.startDate ? (
                  <span className="text-[10px] text-gray-400">{formatInputDate(filters.startDate)}</span>
                ) : null}
              </label>
              <label className="flex flex-col gap-1 text-xs text-gray-600">
                End Date
                <div className="relative">
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="pl-3 pr-9 py-2 rounded-lg border border-gray-300 text-sm text-gray-800 min-w-[160px]"
                  />
                  <FiCalendar className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                </div>
                {filters.endDate ? (
                  <span className="text-[10px] text-gray-400">{formatInputDate(filters.endDate)}</span>
                ) : null}
              </label>
            </div>

            <div className="flex items-center gap-6 border-l border-gray-200 pl-6 ml-auto xl:ml-0">
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-1.5">Online Agents</span>
                <div className="flex -space-x-2">
                  {agentAvatars.map((agent) => (
                    <img
                      key={agent.id}
                      src={getImageUrl(agent.user.profilePicture)}
                      alt=""
                      className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                  ))}
                  {plusMore > 0 ? (
                    <span className="w-9 h-9 flex items-center justify-center bg-gray-200 text-gray-700 text-xs font-semibold rounded-full border-2 border-white shadow-sm">
                      +{plusMore}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                  <img src={getImageUrl(userData?.profilePicture)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="text-sm">
                  <p className="text-gray-500">Welcome</p>
                  <p className="font-semibold text-gray-900">{displayName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-emerald-50/90 border border-emerald-100 p-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-sm border border-emerald-100/80">
              <p className="text-[10px] uppercase tracking-wide text-gray-500">Total Transactions</p>
              <p className="text-lg font-semibold text-[#147341]">
                {stats?.successfulTransactions?.count ?? txStats?.data?.totalTransactions?.count ?? '—'}
              </p>
            </div>
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-[#147341] text-xl border border-emerald-100">
                💬
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Chat Summary</h2>
                <p className="text-sm text-gray-600">View quick stats for your chats.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Total Chats', value: stats?.totalChats?.count },
                { label: 'Successful Chats', value: stats?.successfulTransactions?.count },
                { label: 'Unsuccessful Chats', value: stats?.unsuccessfulChats?.count },
                { label: 'Pending Chats', value: stats?.pendingChats?.count },
                { label: 'Declined Chats', value: stats?.declinedChats?.count },
              ].map((m) => (
                <div key={m.label} className="text-center sm:text-left">
                  <p className="text-xs text-gray-600 mb-1">{m.label}</p>
                  <p className="text-lg font-semibold text-gray-900">{m.value ?? '—'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 text-xl border border-gray-200">
                💬
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Financials</h2>
                <p className="text-sm text-gray-600">View quick stats for your financials.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Crypto Profit</p>
                <p className="text-sm font-semibold text-gray-900">₦{formatNairaAmount(cryptoNgn)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Gift Card Profit</p>
                <p className="text-sm font-semibold text-gray-900">₦{formatNairaAmount(giftNgn)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Bill Payment Profit</p>
                <p className="text-sm font-semibold text-gray-900">₦{formatNairaAmount(billNgn)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Earn</p>
                <p className={`text-sm font-semibold ${earnNegative ? 'text-red-600' : 'text-gray-900'}`}>
                  {earnNegative ? '-' : ''}₦{formatNairaAmount(Math.abs(earnRaw))}
                </p>
              </div>
            </div>
          </div>
        </div>

        <ChatFilters
          layout="chatsHub"
          showCategoryRow={false}
          filters={{ ...filters, search: searchInput }}
          title="Chat History"
          subtitle="Manage total chat and transaction"
          onChange={(updated) => {
            if ('search' in updated) setSearchInput(String(updated.search ?? ''));
            setFilters((prev) => ({ ...prev, ...updated }));
          }}
        />

        {!chatLoading && !chatIsError && !chatError && (
          <>
            <ChatTable
              data={tableRows}
              isChat
              hubLayout
              disableInternalPagination
              onUserViewed={() => null}
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} / {totalPages} · {total} results{isFetching ? ' · updating…' : ''}
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
          </>
        )}

        {chatLoading && <div className="text-sm text-gray-500">Loading chats…</div>}
        {chatIsError && <div className="text-sm text-red-600">Failed to load chats: {String(chatError)}</div>}
      </div>

      <CheckInModal
        isOpen={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        shiftSettings={shiftSettings ?? null}
        onCheckIn={(shift) => checkInMutation.mutate(shift)}
      />
    </>
  );
};

export default Chat;
