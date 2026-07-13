import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IoClose } from 'react-icons/io5';
import { MdAccountBalanceWallet, MdOutlineCloudDownload, MdOutlineShoppingCart } from 'react-icons/md';
import {
  fraudWalletCleanup,
  getAdminUserWalletDetail,
  type AdminUserWalletDetail,
  type AdminUserAssetBalance,
} from '@renderer/api/admin/userBalances';
import { toastError, toastSuccess } from '@renderer/utils/toast';
import { addThousandSeparator, formatNairaAmount } from '@renderer/api/helper';
import { BalanceBucketBadge } from '@renderer/components/BalanceBucketBadge';
import { formatCryptoAmountFromUnknown } from '@renderer/utils/cryptoAmountSync';
import { MasterWalletAssetAvatar } from '@renderer/components/MasterWalletAssetAvatar';
import { isWalletAssetImagePath } from '@renderer/utils/masterWalletAssets';
import TransferSurplusModal from '@renderer/components/modal/TransferSurplusModal';
import {
  displayCurrencyForWalletRow,
  formatAssetListSubtitle,
} from '@renderer/utils/walletCurrencyLabel';

type TabId = 'overview' | 'deposits' | 'virtual' | 'surplus';

interface UserWalletDetailModalProps {
  isOpen: boolean;
  userId: number | null;
  token: string;
  onClose: () => void;
}

function fmtUsd(n: number) {
  return '$' + addThousandSeparator(n);
}

function fmtNgn(n: number) {
  return '₦' + addThousandSeparator(n);
}

function depositStatusPill(status: string) {
  const s = status.toLowerCase();
  if (s.includes('fake')) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
        Fake scam
      </span>
    );
  }
  const cls =
    s.includes('in wallet') ? 'bg-amber-100 text-amber-800'
    : s.includes('transferred') ? 'bg-green-100 text-green-800'
    : s.includes('vendor') ? 'bg-blue-100 text-blue-800'
    : 'bg-gray-100 text-gray-600';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{status}</span>;
}

function assetDisplayLabel(a: {
  currency: string;
  blockchain: string;
  symbol?: string | null;
  iconUrl?: string | null;
  isToken?: boolean | null;
}) {
  const rawSymbol = a.symbol ?? a.currency;
  const ticker = isWalletAssetImagePath(String(rawSymbol))
    ? displayCurrencyForWalletRow(a.currency, a.blockchain, a.isToken ?? undefined)
    : displayCurrencyForWalletRow(String(rawSymbol), a.blockchain, a.isToken ?? undefined);
  return ticker;
}

function activityLabel(type: string) {
  if (type === 'purchase') return { label: 'Virtual purchase', cls: 'bg-purple-100 text-purple-800' };
  if (type === 'sell') return { label: 'Virtual sell', cls: 'bg-orange-100 text-orange-800' };
  return { label: 'Send', cls: 'bg-gray-100 text-gray-700' };
}

function computeSurplus(a: AdminUserAssetBalance): number | null {
  if (!a.depositAddress || a.liveOnChainAtDeposit == null || a.liveOnChainAtDeposit === '') return null;
  const live = Number(a.liveOnChainAtDeposit);
  const recorded = Number(a.onChainBalance);
  if (!Number.isFinite(live) || !Number.isFinite(recorded)) return null;
  const diff = live - recorded;
  return diff > 0.000001 ? diff : null;
}

const UserWalletDetailModal: React.FC<UserWalletDetailModalProps> = ({ isOpen, userId, token, onClose }) => {
  const [tab, setTab] = useState<TabId>('overview');
  const queryClient = useQueryClient();
  const [surplusTransfer, setSurplusTransfer] = useState<{
    asset: AdminUserAssetBalance;
    ticker: string;
    surplus: number;
  } | null>(null);

  const fraudCleanupMutation = useMutation({
    mutationFn: (receiveTxHash?: string) => fraudWalletCleanup(token, userId!, receiveTxHash ? { receiveTxHash } : undefined),
    onSuccess: (result) => {
      toastSuccess('Fraud cleanup done — BSC and NGN ledger zeroed');
      queryClient.invalidateQueries({ queryKey: ['admin-user-wallet-detail', token, userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-balances'] });
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      if (result.actions?.length) console.info('[fraud-cleanup]', result.actions);
    },
    onError: (err: Error) => toastError(err.message || 'Fraud cleanup failed'),
  });

  const handleFraudCleanup = () => {
    const receiveTxHash = window.prompt(
      'Fake receive TX hash (optional — paste 0x… or leave empty):\n\n' +
        'This will:\n' +
        '• Zero BSC virtual + on-chain balances\n' +
        '• Zero NGN wallet\n' +
        '• Mark BSC receive/sell txs as Revoked (fraud)'
    );
    if (receiveTxHash === null) return;
    const ok = window.confirm(
      'Run fraud cleanup for this user?\n\n' +
        'BSC balances and NGN wallet will be forced to 0. This cannot be undone from the UI.'
    );
    if (!ok) return;
    fraudCleanupMutation.mutate(receiveTxHash.trim() || undefined);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-user-wallet-detail', token, userId],
    queryFn: () => getAdminUserWalletDetail(token, userId!),
    enabled: isOpen && !!token && userId != null,
  });

  if (!isOpen || userId == null) return null;

  const detail = data as AdminUserWalletDetail | undefined;
  const name = detail
    ? `${detail.user.firstname} ${detail.user.lastname}`.trim() || detail.user.email
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="relative bg-gradient-to-br from-[#147341] via-[#1a8f52] to-[#0d5a2e] px-6 pt-6 pb-8 text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <IoClose className="w-6 h-6" />
          </button>
          {isLoading ? (
            <div className="py-6 text-white/80">Loading wallet details…</div>
          ) : isError || !detail ? (
            <div className="py-6 text-red-100">Could not load wallet details.</div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold border-2 border-white/30">
                  {detail.user.profilePicture ? (
                    <img src={detail.user.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{detail.user.firstname?.[0]}{detail.user.lastname?.[0]}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{name}</h2>
                  <p className="text-white/80 text-sm">{detail.user.email}</p>
                  {detail.user.username && (
                    <p className="text-white/60 text-xs mt-0.5">@{detail.user.username}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <SummaryChip icon={<MdOutlineShoppingCart />} label="Virtual" value={fmtUsd(detail.balances.virtualBalanceUsd)} tone="purple" />
                <SummaryChip icon={<MdOutlineCloudDownload />} label="On-chain" value={fmtUsd(detail.balances.onChainBalanceUsd)} tone="blue" />
                <SummaryChip icon={<MdAccountBalanceWallet />} label="Total crypto" value={fmtUsd(detail.balances.totalBalanceUsd)} tone="green" />
                <SummaryChip icon={<span className="text-lg">₦</span>} label="NGN wallet" value={fmtNgn(detail.balances.nairaBalance)} tone="gray" />
              </div>
              <button
                type="button"
                onClick={handleFraudCleanup}
                disabled={fraudCleanupMutation.isPending}
                className="mt-4 px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 border border-red-400"
              >
                {fraudCleanupMutation.isPending ? 'Cleaning up…' : 'Fraud cleanup — zero BSC + NGN'}
              </button>
            </>
          )}
        </div>

        {detail && (
          <>
            <div className="flex border-b border-gray-200 px-4 shrink-0 bg-gray-50">
              {([
                ['overview', 'Assets'],
                ['deposits', `Deposits (${detail.deposits.length})`],
                ['virtual', `Virtual activity (${detail.virtualActivity.length})`],
                ['surplus', `Surplus transfers (${detail.surplusTransfers?.length ?? 0})`],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    tab === id
                      ? 'border-[#147341] text-[#147341]'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {tab === 'overview' && (
                <div className="space-y-3">
                  {detail.assets.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No crypto balances.</p>
                  ) : (
                    detail.assets.map((a) => {
                      const ticker = assetDisplayLabel(a);
                      const subtitle = formatAssetListSubtitle(a.currency, a.blockchain, a.isToken ?? undefined);
                      const surplus = computeSurplus(a);
                      return (
                      <div
                        key={`${a.currency}-${a.blockchain}`}
                        className="rounded-xl border border-gray-200 p-4 hover:border-[#147341]/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <MasterWalletAssetAvatar
                              symbol={ticker}
                              iconUrl={a.iconUrl ?? (isWalletAssetImagePath(String(a.symbol ?? '')) ? String(a.symbol) : undefined)}
                              className="w-10 h-10 text-sm"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 text-lg">{ticker}</p>
                              <p className="text-xs text-gray-500">{subtitle || a.blockchain}</p>
                            </div>
                          </div>
                          <p className="font-bold text-gray-900">{fmtUsd(a.totalBalanceUsd)}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <div className="rounded-lg bg-purple-50 p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <BalanceBucketBadge bucket="virtual" />
                            </div>
                            <p className="font-mono text-purple-900">{a.virtualBalance}</p>
                            <p className="text-xs text-purple-600 mt-0.5">{fmtUsd(a.virtualBalanceUsd)}</p>
                            <p className="text-[10px] text-purple-500 mt-1">Recorded in system</p>
                          </div>
                          <div className="rounded-lg bg-blue-50 p-3">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <BalanceBucketBadge bucket="on_chain" />
                              {surplus != null && (
                                <button
                                  type="button"
                                  onClick={() => setSurplusTransfer({ asset: a, ticker, surplus })}
                                  className="text-[10px] font-semibold text-blue-800 bg-blue-100 hover:bg-blue-200 px-2 py-0.5 rounded-md transition-colors"
                                >
                                  Transfer surplus ({formatCryptoAmountFromUnknown(surplus)})
                                </button>
                              )}
                            </div>
                            <p className="font-mono text-blue-900">{a.onChainBalance}</p>
                            <p className="text-xs text-blue-600 mt-0.5">{fmtUsd(a.onChainBalanceUsd)}</p>
                            <p className="text-[10px] text-blue-500 mt-1">Recorded in system</p>
                          </div>
                          <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                            <p className="text-xs font-medium text-amber-800 mb-1">Live at deposit address</p>
                            <p className="font-mono text-amber-900">
                              {a.liveOnChainAtDeposit != null && a.liveOnChainAtDeposit !== ''
                                ? `${formatCryptoAmountFromUnknown(a.liveOnChainAtDeposit)} ${ticker}`
                                : a.depositAddress
                                  ? '—'
                                  : 'No address'}
                            </p>
                            <p className="text-[10px] text-amber-700 mt-1 leading-snug">
                              Blockchain lookup only — not recorded in system ledger
                            </p>
                          </div>
                        </div>
                        {a.depositAddress && (
                          <p className="mt-3 text-xs text-gray-500 font-mono truncate" title={a.depositAddress}>
                            Deposit: {a.depositAddress}
                          </p>
                        )}
                      </div>
                      );
                    })
                  )}
                </div>
              )}

              {tab === 'deposits' && (
                <div className="overflow-x-auto">
                  {detail.deposits.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No on-chain deposits.</p>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase text-gray-500 border-b">
                        <tr>
                          <th className="py-2 pr-3">Date</th>
                          <th className="py-2 pr-3">Asset</th>
                          <th className="py-2 pr-3">Amount</th>
                          <th className="py-2 pr-3">Deposit status</th>
                          <th className="py-2 pr-3">Sold (USD)</th>
                          <th className="py-2 pr-3">User keeps</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.deposits.map((d) => (
                          <tr key={d.transactionId} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 pr-3 whitespace-nowrap text-gray-600">
                              {new Date(d.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 pr-3 font-medium">{d.currency} <span className="text-gray-400 text-xs">({d.blockchain})</span></td>
                            <td className="py-3 pr-3">
                              <p>{formatCryptoAmountFromUnknown(d.amount)}</p>
                              <p className="text-xs text-gray-500">${addThousandSeparator(Number(d.amountUsd) || 0)}</p>
                            </td>
                            <td className="py-3 pr-3">{depositStatusPill(d.depositStatus)}</td>
                            <td className="py-3 pr-3 text-amber-800">
                              {Number(d.soldAmountUsd) > 0 ? fmtUsd(Number(d.soldAmountUsd)) : '—'}
                            </td>
                            <td className="py-3 pr-3 text-gray-600">
                              {Number(d.userRetentionUsd) > 0 ? fmtUsd(Number(d.userRetentionUsd)) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {tab === 'surplus' && (
                <div className="overflow-x-auto">
                  {(detail.surplusTransfers?.length ?? 0) === 0 ? (
                    <p className="text-gray-500 text-center py-8">No recorded surplus transfers.</p>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase text-gray-500 border-b">
                        <tr>
                          <th className="py-2 pr-3">Date</th>
                          <th className="py-2 pr-3">Asset</th>
                          <th className="py-2 pr-3">Amount</th>
                          <th className="py-2 pr-3">To</th>
                          <th className="py-2 pr-3">Status</th>
                          <th className="py-2 pr-3">Tx</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(detail.surplusTransfers ?? []).map((s) => (
                          <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 pr-3 whitespace-nowrap text-gray-600">
                              {new Date(s.date).toLocaleString()}
                            </td>
                            <td className="py-3 pr-3 font-medium">
                              {s.currency} <span className="text-gray-400 text-xs">({s.blockchain})</span>
                            </td>
                            <td className="py-3 pr-3 font-mono">
                              {formatCryptoAmountFromUnknown(s.amount)}
                              {s.surplusAtSend && (
                                <p className="text-xs text-gray-500">surplus {formatCryptoAmountFromUnknown(s.surplusAtSend)}</p>
                              )}
                            </td>
                            <td className="py-3 pr-3 font-mono text-xs max-w-[120px] truncate" title={s.toAddress}>
                              {s.toAddress}
                            </td>
                            <td className="py-3 pr-3 capitalize">{s.status}</td>
                            <td className="py-3 pr-3 font-mono text-xs text-gray-600">
                              {s.txHash ? `${s.txHash.slice(0, 10)}…` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {tab === 'virtual' && (
                <div className="overflow-x-auto">
                  {detail.virtualActivity.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No virtual purchases or sells.</p>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase text-gray-500 border-b">
                        <tr>
                          <th className="py-2 pr-3">Date</th>
                          <th className="py-2 pr-3">Type</th>
                          <th className="py-2 pr-3">Asset</th>
                          <th className="py-2 pr-3">Amount</th>
                          <th className="py-2 pr-3">NGN</th>
                          <th className="py-2 pr-3">Status</th>
                          <th className="py-2">Batch</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.virtualActivity.map((v) => {
                          const act = activityLabel(v.activityType);
                          return (
                            <tr key={v.transactionId} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 pr-3 whitespace-nowrap text-gray-600">
                                {new Date(v.date).toLocaleDateString()}
                              </td>
                              <td className="py-3 pr-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${act.cls}`}>{act.label}</span>
                              </td>
                              <td className="py-3 pr-3 font-medium">{v.currency}</td>
                              <td className="py-3 pr-3">
                                <p>{formatCryptoAmountFromUnknown(v.amount)}</p>
                                <p className="text-xs text-gray-500">${addThousandSeparator(Number(v.amountUsd) || 0)}</p>
                              </td>
                              <td className="py-3 pr-3 text-gray-600">₦{formatNairaAmount(v.amountNaira)}</td>
                              <td className="py-3 pr-3 capitalize">{v.status}</td>
                              <td className="py-3 text-xs font-mono text-gray-400 truncate max-w-[80px]" title={v.sellBatchId ?? undefined}>
                                {v.sellBatchId ? '…' + v.sellBatchId.slice(-6) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {surplusTransfer && userId != null && (
          <TransferSurplusModal
            isOpen
            userId={userId}
            token={token}
            asset={surplusTransfer.asset}
            ticker={surplusTransfer.ticker}
            surplusAmount={surplusTransfer.surplus}
            onClose={() => setSurplusTransfer(null)}
          />
        )}
      </div>
    </div>
  );
};

function SummaryChip({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'purple' | 'blue' | 'green' | 'gray';
}) {
  const bg = {
    purple: 'bg-white/15',
    blue: 'bg-white/15',
    green: 'bg-white/15',
    gray: 'bg-white/10',
  }[tone];
  return (
    <div className={`rounded-xl ${bg} p-3 backdrop-blur-sm`}>
      <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

export default UserWalletDetailModal;
