import React from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { FaPaperPlane } from 'react-icons/fa';
import { HiArrowsUpDown, HiArrowDownTray } from 'react-icons/hi2';
import chatsIcon from '@renderer/assets/images/chats.svg';
import { formatNairaAmount } from '@renderer/api/helper';

const GREEN = '#147341';
const MINT_BG = '#D4F5E4';
const MINT_BORDER = '#B5DEC6';

/** Shared compact spacing — matches Figma reference (not stretched tall). */
const PX = 'px-4';
const HEADER = 'pt-4 pb-3';
const STATS_BLOCK = 'py-3';
const DIVIDER_MX = 'mx-4';

function ChatsCardIcon() {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: GREEN }}
    >
      <img src={chatsIcon} alt="" className="w-[18px] h-[16px] brightness-0 invert" />
    </div>
  );
}

function CardDivider({ className = 'border-gray-200' }: { className?: string }) {
  return <hr className={`border-0 border-t ${className} ${DIVIDER_MX}`} />;
}

type StatItem = { label: string; value: React.ReactNode };

function StatsRow({
  items,
  dividerColor = 'bg-gray-300',
  compact = false,
}: {
  items: StatItem[];
  dividerColor?: string;
  compact?: boolean;
}) {
  const dividerH = compact ? 'h-7' : 'h-8';
  return (
    <div className="flex items-center w-full">
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 ? <div className={`w-px ${dividerH} shrink-0 ${dividerColor}`} aria-hidden /> : null}
          <div className="flex-1 min-w-0 px-2.5 first:pl-0 last:pr-0">
            <p className="text-[11px] text-gray-500 leading-tight mb-0.5">{item.label}</p>
            <div
              className={`font-bold text-gray-900 tabular-nums leading-tight truncate ${
                compact ? 'text-[14px]' : 'text-[15px]'
              }`}
              title={typeof item.value === 'string' || typeof item.value === 'number' ? String(item.value) : undefined}
            >
              {item.value ?? '—'}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

type BalanceView = 'crypto' | 'naira';

type Props = {
  chatStats: {
    totalChats?: number;
    successful?: number;
    unsuccessful?: number;
    pending?: number;
    declined?: number;
    totalTransactions?: number;
  };
  balanceView: BalanceView;
  balanceMenuOpen: boolean;
  balanceLabel: string;
  balanceValue: string;
  masterUsdDisplay: string;
  nairaDepositDisplay: string;
  onBalanceMenuToggle: () => void;
  onBalanceMenuClose: () => void;
  onBalanceViewChange: (view: BalanceView) => void;
  profits: {
    crypto: number;
    giftCard: number;
    billPayment: number;
    earn: number;
    earnNegative: boolean;
  };
  onQuickAction: (href: string) => void;
};

const ChatsHubSummaryCards: React.FC<Props> = ({
  chatStats,
  balanceView,
  balanceMenuOpen,
  balanceLabel,
  balanceValue,
  masterUsdDisplay,
  nairaDepositDisplay,
  onBalanceMenuToggle,
  onBalanceMenuClose,
  onBalanceViewChange,
  profits,
  onQuickAction,
}) => {
  const formatProfit = (n: number) => `N${formatNairaAmount(n)}`;

  const quickActions = [
    { label: 'Send', icon: FaPaperPlane, href: '/master-wallet' },
    { label: 'Swap', icon: HiArrowsUpDown, href: '/master-wallet' },
    { label: 'Deposit', icon: HiArrowDownTray, href: '/master-wallet' },
  ] as const;

  const headerTitle = 'text-[15px] font-semibold text-gray-900 leading-tight';
  const headerSub = 'text-[12px] text-gray-500 mt-0.5 leading-snug';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.14fr_1fr] gap-4 items-stretch">
      {/* Chat Summary — slightly wider; same height as Financials */}
      <div
        className="rounded-xl overflow-hidden w-full h-full flex flex-col min-h-0"
        style={{ backgroundColor: MINT_BG, border: `1px solid ${MINT_BORDER}` }}
      >
        <div className={`flex items-start justify-between gap-3 ${PX} ${HEADER}`}>
          <div className="flex items-start gap-2.5 min-w-0">
            <ChatsCardIcon />
            <div className="min-w-0">
              <h2 className={headerTitle}>Chat Summary</h2>
              <p className={headerSub}>View quick stats for your chats.</p>
            </div>
          </div>
          <div className="shrink-0 rounded-md border border-gray-400/60 bg-white/40 px-2.5 py-1.5 text-center min-w-[96px]">
            <p className="text-[10px] text-gray-600 leading-tight">Total Transactions</p>
            <p className="text-[15px] font-bold text-gray-900 mt-0.5 tabular-nums leading-none">
              {chatStats.totalTransactions ?? '—'}
            </p>
          </div>
        </div>

        <CardDivider className="border-[#A8D5BC]/90" />

        <div className={`${PX} ${STATS_BLOCK}`}>
          <StatsRow
            dividerColor="bg-[#A8D5BC]"
            compact
            items={[
              { label: 'Total Chats', value: chatStats.totalChats },
              { label: 'Successful Chats', value: chatStats.successful },
              { label: 'Unsuccessful Chats', value: chatStats.unsuccessful },
              { label: 'Pending Chats', value: chatStats.pending },
              { label: 'Declined Chats', value: chatStats.declined },
            ]}
          />
        </div>
        {/* Align bottom with Financials action row */}
        <div className="flex-1 min-h-[58px]" aria-hidden />
      </div>

      {/* Financials — narrower column; action row pinned to bottom */}
      <div className="rounded-xl bg-white border border-gray-200 overflow-hidden w-full h-full flex flex-col min-h-0">
        <div className={`flex items-start justify-between gap-2 ${PX} ${HEADER}`}>
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <ChatsCardIcon />
            <div className="min-w-0">
              <h2 className={headerTitle}>Financials</h2>
              <p className={headerSub}>View quick stats for your financials.</p>
            </div>
          </div>

          <div className="relative shrink-0 z-10">
            <button
              type="button"
              onClick={onBalanceMenuToggle}
              className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-md border border-gray-300 bg-white text-left hover:border-gray-400 w-[132px]"
            >
              <FiChevronDown
                className={`w-3.5 h-3.5 text-gray-500 shrink-0 mt-px transition-transform ${balanceMenuOpen ? 'rotate-180' : ''}`}
              />
              <span className="min-w-0 flex-1 overflow-hidden">
                <span className="block text-[10px] text-gray-500 leading-tight truncate">{balanceLabel}</span>
                <span
                  className="block text-[13px] font-bold text-right leading-tight truncate mt-0.5"
                  style={{ color: GREEN }}
                >
                  {balanceValue}
                </span>
              </span>
            </button>
            {balanceMenuOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default"
                  aria-label="Close balance menu"
                  onClick={onBalanceMenuClose}
                />
                <div className="absolute right-0 mt-1 w-[180px] rounded-md border border-gray-200 bg-white shadow-lg z-20 py-0.5">
                  <button
                    type="button"
                    onClick={() => onBalanceViewChange('crypto')}
                    className={`w-full px-2.5 py-2 text-left hover:bg-gray-50 ${balanceView === 'crypto' ? 'bg-emerald-50/80' : ''}`}
                  >
                    <span className="block text-[10px] text-gray-500">Master Wallet balance</span>
                    <span className="block text-[12px] font-bold text-right truncate" style={{ color: GREEN }}>
                      {masterUsdDisplay}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onBalanceViewChange('naira')}
                    className={`w-full px-2.5 py-2 text-left hover:bg-gray-50 border-t border-gray-100 ${balanceView === 'naira' ? 'bg-emerald-50/80' : ''}`}
                  >
                    <span className="block text-[10px] text-gray-500">User deposit balances</span>
                    <span className="block text-[12px] font-bold text-right truncate" style={{ color: GREEN }}>
                      {nairaDepositDisplay}
                    </span>
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <CardDivider />

        <div className={`${PX} ${STATS_BLOCK}`}>
          <StatsRow
            items={[
              { label: 'Crypto Profit', value: formatProfit(profits.crypto) },
              { label: 'Gift Card Profit', value: formatProfit(profits.giftCard) },
              { label: 'Bill Payment Profit', value: formatProfit(profits.billPayment) },
              {
                label: 'Earn',
                value: (
                  <span className={profits.earnNegative ? 'text-red-500' : 'text-gray-900'}>
                    {profits.earnNegative ? '-' : ''}
                    {formatProfit(Math.abs(profits.earn))}
                  </span>
                ),
              },
            ]}
          />
        </div>

        <div className={`${PX} pb-3.5 pt-0 flex items-start gap-3 mt-auto`}>
          {quickActions.map(({ label, icon: Icon, href }) => (
            <button
              key={label}
              type="button"
              onClick={() => onQuickAction(href)}
              className="flex flex-col items-center gap-1"
            >
              <span className="w-11 h-11 rounded-lg border border-gray-300 bg-white flex items-center justify-center hover:border-gray-400 transition-colors">
                <Icon className="w-[18px] h-[18px]" style={{ color: GREEN }} />
              </span>
              <span className="text-[11px] text-gray-500 leading-none">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatsHubSummaryCards;
