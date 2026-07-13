import { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { FiCalendar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ChatsHubSummaryCards from '@renderer/components/chats/ChatsHubSummaryCards';
import { useAuth } from '@renderer/context/authContext';
import {
  getAllAgentToCusomterChats,
  getChatStats,
  getTeamStats,
  PaginatedChatsResponse,
  ChatRow,
} from '@renderer/api/queries/admin.chat.queries';
import { getAllAgentss } from '@renderer/api/queries/adminqueries';
import {
  getDailyReportShiftSettings,
  type ShiftType,
} from '@renderer/api/admin/dailyReport';
import { useDailyReportSession } from '@renderer/context/dailyReportSessionContext';
import { getProfitTrackerStats } from '@renderer/api/admin/profitTracker';
import { getMasterWalletBalancesSummary } from '@renderer/api/admin/masterWallet';
import { getAdminUserBalancesSummary } from '@renderer/api/admin/userBalances';
import { getReferralsSummary } from '@renderer/api/admin/referrals';
import CheckInModal from '@renderer/components/modal/CheckInModal';
import ChatFilters from '@renderer/components/ChatFilters';
import ChatTable from '@renderer/components/ChatTable';
import type { AgentToCustomerChatData } from '@renderer/api/queries/datainterfaces';
import { getImageUrl, formatNairaAmount, addThousandSeparator } from '@renderer/api/helper';
import { apiDateParams } from '@renderer/utils/dateRange';
import { bucketChatProfitsFromLedger } from '@renderer/utils/chatFinancials';
import { MASTER_WALLET_ID } from '@renderer/data/masterWalletData';

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

type BalanceView = 'crypto' | 'naira';

const Chat = () => {
  const { token, userData } = useAuth();
  const navigate = useNavigate();
  const { checkIn, checkOut, isCheckingIn, isCheckingOut, isClockedIn } = useDailyReportSession();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [balanceView, setBalanceView] = useState<BalanceView>('crypto');
  const [balanceMenuOpen, setBalanceMenuOpen] = useState(false);

  const [dateRangePresetActive, setDateRangePresetActive] = useState(false);
  const [filters, setFilters] = useState<UIFilters>({
    status: 'All',
    type: 'All',
    dateRange: 'All',
    search: '',
    transactionType: 'All',
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
    refetchInterval: 3000,
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

  const profitDateParams = useMemo(() => {
    const { startDate, endDate } = apiDateParams({
      startDate: filters.startDate,
      endDate: filters.endDate,
      dateRange: filters.dateRange,
      dateRangePresetActive,
    });
    return {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
  }, [filters.startDate, filters.endDate, filters.dateRange, dateRangePresetActive]);

  const { data: profitStats } = useQuery({
    queryKey: ['chat-profit-stats', token, profitDateParams],
    queryFn: () => getProfitTrackerStats(token!, profitDateParams),
    enabled: !!token,
  });

  const { data: masterSummary } = useQuery({
    queryKey: ['chat-master-wallet-summary', token],
    queryFn: () => getMasterWalletBalancesSummary(token!),
    enabled: !!token,
  });

  const { data: userDepositSummary } = useQuery({
    queryKey: ['chat-user-deposit-summary', token],
    queryFn: () => getAdminUserBalancesSummary(token!),
    enabled: !!token,
  });

  const { data: referralSummary } = useQuery({
    queryKey: ['chat-referral-summary', token, profitDateParams],
    queryFn: () => getReferralsSummary(token!, profitDateParams),
    enabled: !!token,
  });

  const { data: shiftSettings } = useQuery({
    queryKey: ['daily-report-shift-chat'],
    queryFn: () => getDailyReportShiftSettings(token!),
    enabled: !!token && checkInOpen,
  });

  const handleCheckIn = (shift: ShiftType) => {
    checkIn(shift);
  };

  useEffect(() => {
    if (isClockedIn) setCheckInOpen(false);
  }, [isClockedIn]);

  const backendFilters = useMemo(() => {
    const out: Record<string, string | undefined> = {};
    if (filters.status !== 'All') out.status = filters.status;
    if (filters.type !== 'All') out.type = filters.type;
    if (filters.category !== 'All') out.category = filters.category;

    const { startDate, endDate } = apiDateParams({
      startDate: filters.startDate,
      endDate: filters.endDate,
      dateRange: filters.dateRange,
      dateRangePresetActive,
    });
    if (startDate) out.start = startDate;
    if (endDate) out.end = endDate;

    if (filters.search.trim()) out.q = filters.search.trim();
    return out;
  }, [filters, dateRangePresetActive]);

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
    placeholderData: keepPreviousData,
    refetchInterval: 3000,
  });

  const rows: ChatRow[] = chatsResp?.data ?? [];
  const tableRows = useMemo(() => rows.map(chatRowToAgentData), [rows]);
  const total = chatsResp?.total ?? 0;
  const totalPages = chatsResp?.totalPages ?? 1;

  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.type, filters.category, filters.startDate, filters.endDate, filters.dateRange]);

  const stats = chatStatsData?.data;

  const profitBuckets = useMemo(() => {
    const byType = (profitStats?.byTransactionType as Array<{ transactionType?: string; totalProfit?: string }>) ?? [];
    return bucketChatProfitsFromLedger(byType);
  }, [profitStats]);

  const referralPaidOut = Number(referralSummary?.amountPaidOut ?? 0);
  const earnNgn = profitBuckets.earn !== 0 ? profitBuckets.earn : -referralPaidOut;
  const earnNegative = earnNgn < 0;

  const masterRow = useMemo(() => {
    const list = masterSummary?.summary ?? [];
    return list.find((s) => String(s.walletId).toLowerCase() === MASTER_WALLET_ID) ?? list[0];
  }, [masterSummary]);

  const masterUsdDisplay = useMemo(() => {
    const usd = masterRow?.totalUsd;
    if (usd == null || usd === '—' || !Number.isFinite(Number(usd))) return String(usd ?? '—');
    return `$${addThousandSeparator(Number(usd))}`;
  }, [masterRow]);

  const nairaDepositDisplay = useMemo(() => {
    const ngn = userDepositSummary?.totalDepositNgn ?? 0;
    return `N${formatNairaAmount(ngn)}`;
  }, [userDepositSummary]);

  const balanceLabel =
    balanceView === 'crypto' ? 'Master Wallet balance' : 'User deposit balances';
  const balanceValue = balanceView === 'crypto' ? masterUsdDisplay : nairaDepositDisplay;

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
                  checkOut();
                }}
                disabled={isCheckingOut}
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

        <ChatsHubSummaryCards
          chatStats={{
            totalChats: stats?.totalChats?.count,
            successful: stats?.successfulTransactions?.count,
            unsuccessful: stats?.unsuccessfulChats?.count,
            pending: stats?.pendingChats?.count,
            declined: stats?.declinedChats?.count,
            totalTransactions: stats?.totalChats?.count ?? stats?.successfulTransactions?.count,
          }}
          balanceView={balanceView}
          balanceMenuOpen={balanceMenuOpen}
          balanceLabel={balanceLabel}
          balanceValue={balanceValue}
          masterUsdDisplay={masterUsdDisplay}
          nairaDepositDisplay={nairaDepositDisplay}
          onBalanceMenuToggle={() => setBalanceMenuOpen((o) => !o)}
          onBalanceMenuClose={() => setBalanceMenuOpen(false)}
          onBalanceViewChange={(view) => {
            setBalanceView(view);
            setBalanceMenuOpen(false);
          }}
          profits={{
            crypto: profitBuckets.crypto,
            giftCard: profitBuckets.giftCard,
            billPayment: profitBuckets.billPayment,
            earn: earnNgn,
            earnNegative,
          }}
          onQuickAction={(href) => navigate(href)}
        />

        <ChatFilters
          layout="chatsHub"
          showCategoryRow={false}
          filters={{ ...filters, search: searchInput }}
          title="Chat History"
          subtitle="Manage total chat and transaction"
          onChange={(updated) => {
            if ('search' in updated) setSearchInput(String(updated.search ?? ''));
            if ('dateRange' in updated) setDateRangePresetActive(true);
            setFilters((prev) => ({ ...prev, ...updated }));
          }}
        />

        {!(chatLoading && !chatsResp) && !chatIsError && !chatError && (
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

        {chatLoading && !chatsResp && <div className="text-sm text-gray-500">Loading chats…</div>}
        {isFetching && chatsResp && <div className="text-sm text-gray-500">Updating…</div>}
        {chatIsError && <div className="text-sm text-red-600">Failed to load chats: {String(chatError)}</div>}
      </div>

      <CheckInModal
        isOpen={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        shiftSettings={shiftSettings ?? null}
        onCheckIn={handleCheckIn}
        isPending={isCheckingIn}
      />
    </>
  );
};

export default Chat;
