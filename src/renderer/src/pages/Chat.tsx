import { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { FiSearch } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ChatsHubSummaryCards from '@renderer/components/chats/ChatsHubSummaryCards';
import { useAuth } from '@renderer/context/authContext';
import {
  getAllAgentToCusomterChats,
  getChatStats,
  getTeamStats,
  PaginatedChatsResponse,
  ChatRow,
  type StatsTimeWindow,
} from '@renderer/api/queries/admin.chat.queries';
import { getAllAgentss } from '@renderer/api/queries/adminqueries';
import {
  getDailyReportShiftSettings,
  type ShiftType,
} from '@renderer/api/admin/dailyReport';
import { useDailyReportSession } from '@renderer/context/dailyReportSessionContext';
import { getMarkupProfitOverview } from '@renderer/api/admin/profitTracker';
import { listBushaCustomerWallets } from '@renderer/api/admin/busha';
import { getReferralsSummary } from '@renderer/api/admin/referrals';
import CheckInModal from '@renderer/components/modal/CheckInModal';
import ChatFilters from '@renderer/components/ChatFilters';
import ChatTable from '@renderer/components/ChatTable';
import type { AgentToCustomerChatData } from '@renderer/api/queries/datainterfaces';
import { getImageUrl, addThousandSeparator } from '@renderer/api/helper';
import { apiDateParams, toDateString, toApiInclusiveEnd } from '@renderer/utils/dateRange';

const PAGE_SIZE = 50;
/** Live hub refresh — light enough for admin, fresh enough for the client. */
const HUB_POLL_MS = 15_000;

const TIME_WINDOW_OPTIONS: { label: string; value: StatsTimeWindow }[] = [
  { label: 'Today', value: 'all' },
  { label: 'Last 12 hours', value: 'last12hrs' },
  { label: 'Day 8am–8pm', value: 'dayShift' },
  { label: 'Night 8pm–8am', value: 'nightShift' },
];

type UIFilters = {
  status: string;
  type: string;
  dateRange: 'Last 7 days' | 'Last 15 days' | 'Last 30 days' | 'All' | 'Last 90 days';
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
    department: row.department
      ? {
          id: numId(row.department.id),
          title: row.department.title ?? '',
          Type: row.department.Type ?? '',
          niche: row.department.niche ?? '',
        }
      : { id: 0, title: '', Type: '', niche: '' },
    category: row.category
      ? {
          id: numId(row.category.id),
          title: row.category.title ?? '',
        }
      : undefined,
    messagesCount: 0,
    transactionsCount: row.transactionsCount ?? 0,
    transactions: (row.transactions || []).map((t) => ({
      id: numId(t.id),
      amount: t.amount ?? undefined,
      amountNaira: t.amountNaira ?? undefined,
    })),
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

function toCheckInIso(checkInTime: string): string {
  const d = new Date(checkInTime);
  return Number.isNaN(d.getTime()) ? checkInTime : d.toISOString();
}

type BalanceView = 'customers' | 'trades';

const Chat = () => {
  const { token, userData } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkIn, checkOut, isCheckingIn, isCheckingOut, isClockedIn, session } =
    useDailyReportSession();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [balanceView, setBalanceView] = useState<BalanceView>('customers');
  const [balanceMenuOpen, setBalanceMenuOpen] = useState(false);
  const [timeWindow, setTimeWindow] = useState<StatsTimeWindow>('all');

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

  // Filter chat history when navigating from customer header click (?q=username)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q != null && q !== '') {
      setSearchInput(q);
      setFilters((prev) => ({ ...prev, search: q }));
      setPage(1);
    }
  }, [searchParams]);

  // Summary cards stay "this work day" (today, or since clock-in). Chat history
  // dates are independent — empty until the agent applies a filter.
  const freshWorkParams = useMemo(() => {
    const today = toDateString(new Date());
    let start: string = today;
    const end = toApiInclusiveEnd(today);
    if (isClockedIn && session?.checkInTime) {
      const checkInIso = toCheckInIso(session.checkInTime);
      if (checkInIso.slice(0, 10) === today) {
        start = checkInIso;
      }
    }
    return { start, end };
  }, [isClockedIn, session?.checkInTime]);

  const statsQueryParams = useMemo(() => {
    if (timeWindow !== 'all') {
      return { timeWindow } as const;
    }
    return { start: freshWorkParams.start, end: freshWorkParams.end } as const;
  }, [timeWindow, freshWorkParams.start, freshWorkParams.end]);

  const sinceClockIn =
    timeWindow === 'all' &&
    !!isClockedIn &&
    !!session?.checkInTime &&
    freshWorkParams.start === toCheckInIso(session.checkInTime);

  const { data: chatStatsData } = useQuery({
    queryKey: ['chatStats', token, statsQueryParams],
    queryFn: () =>
      getChatStats({
        token: token!,
        ...statsQueryParams,
      }),
    enabled: !!token,
    refetchInterval: HUB_POLL_MS,
  });

  const { data: teamStats } = useQuery({
    queryKey: ['teamStats', token],
    queryFn: () => getTeamStats({ token: token! }),
    enabled: !!token,
    refetchInterval: HUB_POLL_MS,
  });

  const { data: agentsList } = useQuery({
    queryKey: ['all-agents-chat-page'],
    queryFn: () => getAllAgentss({ token: token! }),
    enabled: !!token,
    refetchInterval: HUB_POLL_MS,
  });

  const profitDateParams = useMemo(() => {
    // Same work-day window as Chat Summary (keep clock-in ISO for markup overview)
    return {
      startDate: freshWorkParams.start,
      endDate: freshWorkParams.end,
    };
  }, [freshWorkParams.start, freshWorkParams.end]);

  const { data: markupProfit } = useQuery({
    queryKey: ['chat-markup-profit', token, profitDateParams],
    queryFn: () => getMarkupProfitOverview(token!, profitDateParams),
    enabled: !!token,
    refetchInterval: HUB_POLL_MS,
  });

  const { data: bushaWalletsSummary } = useQuery({
    queryKey: ['chat-busha-wallets-summary', token],
    queryFn: () => listBushaCustomerWallets(token!, { page: 1, limit: 1 }),
    enabled: !!token,
    staleTime: 60_000,
    refetchInterval: HUB_POLL_MS,
  });

  const { data: referralSummary } = useQuery({
    queryKey: ['chat-referral-summary', token, profitDateParams],
    queryFn: () => getReferralsSummary(token!, profitDateParams),
    enabled: !!token,
    refetchInterval: HUB_POLL_MS,
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
    if (endDate) out.end = toApiInclusiveEnd(endDate);

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
    refetchInterval: HUB_POLL_MS,
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
    const s = markupProfit?.summary;
    return {
      crypto: Number(s?.cryptoMarkupNgn ?? 0),
      giftCard: Number(s?.giftCardSellProfitNgn ?? 0),
      billPayment: Number(s?.billPaymentFeeNgn ?? 0),
      earn: 0,
    };
  }, [markupProfit]);

  const referralPaidOut = Number(referralSummary?.amountPaidOut ?? 0);
  const earnNgn = -referralPaidOut;
  const earnNegative = earnNgn < 0;

  const bushaCustomersDisplay = useMemo(() => {
    const n = bushaWalletsSummary?.summary?.customers;
    if (n == null) return '—';
    const active = bushaWalletsSummary?.summary?.activeCustomers;
    return active != null ? `${addThousandSeparator(n)} (${addThousandSeparator(active)} active)` : addThousandSeparator(n);
  }, [bushaWalletsSummary]);

  const bushaTradesDisplay = useMemo(() => {
    const n = bushaWalletsSummary?.summary?.trades;
    return n == null ? '—' : addThousandSeparator(n);
  }, [bushaWalletsSummary]);

  const balanceLabel = balanceView === 'customers' ? 'Busha customers' : 'Busha trades';
  const balanceValue = balanceView === 'customers' ? bushaCustomersDisplay : bushaTradesDisplay;

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

            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value as StatsTimeWindow)}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white min-w-[160px]"
              aria-label="Stats time window"
            >
              {TIME_WINDOW_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Search moved here from ChatFilters (was date range position) */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 bg-white min-w-[220px] flex-1 max-w-md">
              <FiSearch className="text-gray-400 shrink-0 mr-2" />
              <input
                type="text"
                placeholder="Search customer"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="outline-none text-sm text-gray-700 w-full bg-transparent"
              />
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
            successful:
              stats?.successfulChats?.count ?? stats?.successfulTransactions?.count,
            unsuccessful: stats?.unsuccessfulChats?.count,
            pending: stats?.pendingChats?.count,
            declined: stats?.declinedChats?.count,
            totalTransactions:
              stats?.successfulTransactions?.count ?? stats?.totalChats?.count,
          }}
          sinceClockIn={sinceClockIn}
          balanceView={balanceView}
          balanceMenuOpen={balanceMenuOpen}
          balanceLabel={balanceLabel}
          balanceValue={balanceValue}
          bushaCustomersDisplay={bushaCustomersDisplay}
          bushaTradesDisplay={bushaTradesDisplay}
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
          showSearch={false}
          filters={{
            ...filters,
            search: searchInput,
            startDate: filters.startDate,
            endDate: filters.endDate,
          }}
          title="Chat History"
          subtitle="Manage total chat and transaction"
          onChange={(updated) => {
            if ('search' in updated) setSearchInput(String(updated.search ?? ''));
            if ('dateRange' in updated) {
              setDateRangePresetActive(true);
              // Clearing custom dates lets the preset drive the API range
              if (updated.dateRange && updated.dateRange !== 'All') {
                setFilters((prev) => ({
                  ...prev,
                  ...updated,
                  startDate: '',
                  endDate: '',
                }));
                return;
              }
            }
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
              onUserViewed={(customerId) => {
                navigate(`/transaction-details/${customerId}`);
              }}
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
