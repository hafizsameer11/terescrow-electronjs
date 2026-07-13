import React, { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { FiSearch } from 'react-icons/fi';
import { useAuth, canAccessWalletOperations } from '@renderer/context/authContext';
import TrackingDetailsModal from '@renderer/components/modal/TrackingDetailsModal';
import ReceivedAssetDispositionModal, {
  type DispositionModalTab,
} from '@renderer/components/modal/ReceivedAssetDispositionModal';
import BulkSendToVendorModal from '@renderer/components/modal/BulkSendToVendorModal';
import ChangeNowCreateSwapModal from '@renderer/components/modal/ChangeNowCreateSwapModal';
import UserWalletDetailModal from '@renderer/components/modal/UserWalletDetailModal';
import {
  getTransactionTrackingList,
  getTransactionTrackingSteps,
  getTransactionTrackingDetails,
} from '@renderer/api/admin/transactionTracking';
import { getAdminVendors } from '@renderer/api/admin/vendors';
import type { SendModalVendor } from '@renderer/components/modal/SendCryptoModal';
import type { TrackingListItem } from '@renderer/data/transactionTrackingData';
import { apiDateParams } from '@renderer/utils/dateRange';
import { useDebouncedValue } from '@renderer/utils/useDebouncedValue';
import ListFetchingIndicator from '@renderer/components/ListFetchingIndicator';
import { addThousandSeparator } from '@renderer/api/helper';
import { formatCryptoAmountFromUnknown } from '@renderer/utils/cryptoAmountSync';
import {
  formatCryptoTxStatusLabel,
  formatFlagReasonLabel,
  isPendingVerificationRow,
  isFakeDepositRow,
  isFakeScamDepositStatus,
} from '@renderer/utils/fakeDeposit';

function formatUsdCell(value: string | undefined | null): string {
  if (value == null || value === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '—';
  return `$${addThousandSeparator(n)}`;
}

function formatSoldCell(row: TrackingListItem): { usd: string; crypto: string | null } {
  const usd = formatUsdCell(row.soldAmountUsd ?? '0');
  const cryptoAmt = formatCryptoAmountFromUnknown(row.soldAmount ?? '0');
  if (cryptoAmt === '—' || cryptoAmt === '0') {
    return { usd, crypto: null };
  }
  return {
    usd,
    crypto: `${cryptoAmt} ${row.currency}`,
  };
}

function masterWalletBadge(status: string) {
  const raw = (status || '').trim();
  if (!raw || raw === '—' || raw.toLowerCase() === 'n/a') {
    return <span className="text-gray-400 text-xs">—</span>;
  }
  if (isFakeScamDepositStatus(raw)) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
        Fake scam
      </span>
    );
  }
  const s = raw.toLowerCase();
  const map: Record<string, { label: string; cls: string }> = {
    inwallet: { label: 'In Wallet', cls: 'bg-yellow-100 text-yellow-800' },
    transferredtomaster: { label: 'Transferred', cls: 'bg-green-100 text-green-800' },
    senttovendor: { label: 'Sent to vendor', cls: 'bg-blue-100 text-blue-800' },
    unknown: { label: 'Unknown', cls: 'bg-gray-100 text-gray-600' },
  };
  const key = s.replace(/\s/g, '') as keyof typeof map;
  const c = map[key] ?? map.unknown;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.cls}`}>{c.label}</span>;
}

function isOnChainDepositRow(row: TrackingListItem): boolean {
  return (row.ledgerType ?? 'on_chain_deposit') === 'on_chain_deposit';
}

function flagBadge(row: TrackingListItem) {
  if (isPendingVerificationRow(row)) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
        Pending verify
      </span>
    );
  }
  const flagged = row.flagged ?? isFakeDepositRow(row);
  if (!flagged) {
    return <span className="text-gray-400 text-xs">—</span>;
  }
  const label = formatFlagReasonLabel(row.flagReason);
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
      {label}
    </span>
  );
}

function statusPill(status: string) {
  const s = status.toLowerCase();
  const isFraud = s === 'fake' || s === 'revoked';
  const isSuccess = s === 'successful';
  const isPending = s === 'pending' || s === 'processing';
  const label = formatCryptoTxStatusLabel(status);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isFraud ? 'bg-red-100 text-red-800 border border-red-300 font-bold'
          : isSuccess ? 'bg-green-100 text-green-800'
          : isPending ? 'bg-amber-100 text-amber-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isFraud ? 'bg-red-700' : isSuccess ? 'bg-green-600' : isPending ? 'bg-amber-600' : 'bg-red-600'
        }`}
      />
      {label}
    </span>
  );
}

function truncateHash(hash: string, chars = 8) {
  if (!hash || hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

/** Bulk guide: prefer successful receives not already disbursed / transferred (server validates too). */
function rowSelectableForBulk(row: TrackingListItem): boolean {
  if (isFakeDepositRow(row)) return false;
  const ledger = row.ledgerType ?? 'on_chain_deposit';
  if (ledger !== 'on_chain_deposit') return false;
  const st = (row.status || '').toLowerCase();
  if (st !== 'successful') return false;
  const m = (row.masterWalletStatus || '').toLowerCase().replace(/\s/g, '');
  if (m === 'senttovendor' || m === 'transferredtomaster') return false;
  return true;
}

/** ChangeNOW swap is allowed from received assets currently in wallet. */
function rowSwappableForChangeNow(row: TrackingListItem): boolean {
  if (isFakeDepositRow(row)) return false;
  const ledger = row.ledgerType ?? 'on_chain_deposit';
  if (ledger !== 'on_chain_deposit') return false;
  const st = (row.status || '').toLowerCase();
  if (st !== 'successful') return false;
  const m = (row.masterWalletStatus || '').toLowerCase().replace(/\s/g, '');
  return m === 'inwallet';
}

const TransactionTrackingPage: React.FC = () => {
  const { token, userData } = useAuth();
  const canOperate = canAccessWalletOperations(userData?.role, userData);
  const [dateRange, setDateRange] = useState('All');
  const [dateRangePresetActive, setDateRangePresetActive] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 400);
  const [page, setPage] = useState(1);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [pendingVerifyOnly, setPendingVerifyOnly] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TrackingListItem | null>(null);
  const [dispositionOpen, setDispositionOpen] = useState(false);
  const [dispositionDefaultTab, setDispositionDefaultTab] = useState<DispositionModalTab>('vendor');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<TrackingListItem[]>([]);
  const [walletUserId, setWalletUserId] = useState<number | null>(null);
  const { startDate, endDate } = useMemo(
    () => apiDateParams({ dateRange, dateRangePresetActive }),
    [dateRange, dateRangePresetActive]
  );

  const { data: listData, isLoading, isFetching } = useQuery({
    queryKey: ['admin-transaction-tracking', token, startDate, endDate, debouncedSearch, flaggedOnly, pendingVerifyOnly, page],
    queryFn: () =>
      getTransactionTrackingList({
        token: token!,
        startDate,
        endDate,
        search: debouncedSearch || undefined,
        flagged: flaggedOnly || undefined,
        pendingVerification: pendingVerifyOnly || undefined,
        page,
        limit: 20,
      }),
    enabled: !!token,
    placeholderData: keepPreviousData,
  });

  const initialLoad = isLoading && !listData;

  const list = listData?.items ?? [];
  const totalPages = listData?.totalPages ?? 0;
  const total = listData?.total ?? 0;

  const { data: steps = [] } = useQuery({
    queryKey: ['admin-transaction-tracking-steps', token, selectedTx?.transactionId],
    queryFn: () => getTransactionTrackingSteps(token!, selectedTx!.transactionId),
    enabled: !!token && !!selectedTx && detailsOpen,
  });

  const { data: details } = useQuery({
    queryKey: ['admin-transaction-tracking-details', token, selectedTx?.transactionId],
    queryFn: () => getTransactionTrackingDetails(token!, selectedTx!.transactionId),
    /** Load when viewing details or opening disburse from the table (for canSubmit / blockReason). */
    enabled: !!token && !!selectedTx && (detailsOpen || dispositionOpen || swapOpen),
  });

  const { data: vendorsList } = useQuery({
    queryKey: ['admin-vendors', token],
    queryFn: () => getAdminVendors(token!),
    enabled: !!token,
  });
  const vendorsForDisposition = useMemo((): SendModalVendor[] => {
    const arr = Array.isArray(vendorsList) ? vendorsList : (vendorsList as any)?.rows ?? (vendorsList as any)?.data ?? [];
    return (arr as SendModalVendor[]).map((v) => ({
      id: v.id,
      name: v.name,
      network: v.network,
      currency: v.currency,
      walletAddress: v.walletAddress,
    }));
  }, [vendorsList]);

  const canSendToVendor = useMemo(() => {
    if (!details) return true;
    if (isFakeDepositRow({ status: details.status, masterWalletStatus: details.masterWalletStatus })) return false;
    const txSt = (details.status || '').toLowerCase();
    if (txSt !== 'successful') return false;
    const ra = details.receivedAsset;
    if (ra?.status === 'sentToVendor') return false;
    if (ra?.status === 'transferredToMaster') return false;
    if (details.disbursements?.some((x) => (x.status || '').toLowerCase() === 'successful')) return false; // vendor or master_wallet
    return true;
  }, [details]);

  const sendToVendorBlockReason = useMemo(() => {
    if (!details) return undefined;
    if (isFakeDepositRow({ status: details.status, masterWalletStatus: details.masterWalletStatus })) {
      return 'Fake/scam token deposit — never credited, cannot be sent or swapped.';
    }
    const txSt = (details.status || '').toLowerCase();
    if (txSt !== 'successful') return 'Crypto transaction must be successful before vendor payout.';
    if (details.receivedAsset?.status === 'sentToVendor') return 'This deposit was already sent to a vendor.';
    if (details.receivedAsset?.status === 'transferredToMaster') {
      return 'Received asset is marked transferred to master; vendor payout is blocked.';
    }
    if (details.disbursements?.some((x) => (x.status || '').toLowerCase() === 'successful')) {
      return 'A successful deposit disbursement already exists (vendor or master wallet).';
    }
    return undefined;
  }, [details]);

  const openDetails = (row: TrackingListItem) => {
    setSelectedTx(row);
    setDetailsOpen(true);
  };

  const openSendToVendorModal = () => {
    setDispositionDefaultTab('vendor');
    setDispositionOpen(true);
  };

  const openSendToMasterModal = () => {
    setDispositionDefaultTab('master');
    setDispositionOpen(true);
  };

  const openDisburseFromRow = (row: TrackingListItem) => {
    setSelectedTx(row);
    setDispositionDefaultTab('vendor');
    setDispositionOpen(true);
  };

  const toggleRow = (row: TrackingListItem) => {
    setSelectedRows((prev) => {
      const has = prev.some((r) => r.transactionId === row.transactionId);
      if (has) return prev.filter((r) => r.transactionId !== row.transactionId);
      if (prev.length >= 100) return prev;
      return [...prev, row];
    });
  };

  const togglePage = () => {
    const selectable = list.filter((r) => rowSelectableForBulk(r));
    const allSelected = selectable.length > 0 && selectable.every((r) => selectedRows.some((s) => s.transactionId === r.transactionId));
    if (allSelected) {
      setSelectedRows((prev) => prev.filter((s) => !selectable.some((r) => r.transactionId === s.transactionId)));
    } else {
      setSelectedRows((prev) => {
        const ids = new Set(prev.map((p) => p.transactionId));
        const add = selectable.filter((r) => !ids.has(r.transactionId)).slice(0, 100 - prev.length);
        return [...prev, ...add];
      });
    }
  };

  return (
    <div className="w-full p-6 space-y-6">
      <h1 className="text-[40px] font-normal text-gray-800">Deposit Tracking</h1>
      <p className="text-sm text-gray-600 max-w-4xl">
        On-chain customer deposits — disbursement status, sold amounts, and dates. Click a customer name to open their wallet (live on-chain at deposit addresses is shown there, not in this table). Virtual activity is under <span className="font-medium">User Wallets</span>.
      </p>
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 max-w-4xl">
        <span className="font-semibold">Fraud lock (automatic):</span> Unlisted token contracts are recorded as{' '}
        <span className="font-medium">Fake scam</span> — never credited. The user is <span className="font-medium">banned immediately</span>{' '}
        (no send/sell/swap/deposit/withdraw). Admin + user receive email alerts.
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={dateRange}
          onChange={(e) => {
            setDateRange(e.target.value);
            setDateRangePresetActive(true);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="All">All</option>
          <option value="Last 7 days">Last 7 days</option>
          <option value="Last 30 days">Last 30 days</option>
          <option value="Last 90 days">Last 90 days</option>
        </select>
        <label className="inline-flex items-center gap-2 px-3 py-2 border border-red-200 rounded-lg text-sm bg-red-50 text-red-900 cursor-pointer">
          <input
            type="checkbox"
            checked={flaggedOnly}
            onChange={(e) => {
              setFlaggedOnly(e.target.checked);
              setPage(1);
            }}
            className="rounded border-red-400"
          />
          Flagged / fake only
        </label>
        <label className="inline-flex items-center gap-2 px-3 py-2 border border-amber-200 rounded-lg text-sm bg-amber-50 text-amber-900 cursor-pointer">
          <input
            type="checkbox"
            checked={pendingVerifyOnly}
            onChange={(e) => {
              setPendingVerifyOnly(e.target.checked);
              setPage(1);
            }}
            className="rounded border-amber-400"
          />
          Pending verify only
        </label>
        {canOperate && selectedRows.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">{selectedRows.length} selected</span>
            <button
              type="button"
              onClick={() => setBulkOpen(true)}
              className="px-3 py-1.5 bg-[#147341] text-white rounded-lg font-medium hover:bg-[#0d5a2e]"
            >
              Bulk send to vendor
            </button>
            <button type="button" onClick={() => setSelectedRows([])} className="text-gray-600 hover:underline">
              Clear
            </button>
          </div>
        )}
        <div className="relative min-w-[220px] ml-auto">
          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tx hash, address, name..."
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      <ListFetchingIndicator show={isFetching && !initialLoad} />
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium">
                {canOperate && (
                  <th className="px-2 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={list.length > 0 && list.filter(rowSelectableForBulk).every((r) => selectedRows.some((s) => s.transactionId === r.transactionId)) && list.filter(rowSelectableForBulk).length > 0}
                      onChange={togglePage}
                      title="Select eligible rows on this page"
                      className="rounded border-gray-400"
                    />
                  </th>
                )}
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Flag</th>
                <th className="px-4 py-3">Deposit status</th>
                <th className="px-4 py-3">TX Hash</th>
                <th className="px-4 py-3">Booked amount</th>
                <th className="px-4 py-3">USD Value</th>
                <th className="px-4 py-3">Sold</th>
                <th className="px-4 py-3">User keeps</th>
                <th className="px-4 py-3">Blockchain</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right min-w-[140px]">{canOperate ? 'Actions' : 'Details'}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={canOperate ? 13 : 12} className="p-6 text-center text-gray-500">Loading...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={canOperate ? 13 : 12} className="p-6 text-center text-gray-500">No deposits found.</td></tr>
              ) : (
                list.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      isPendingVerificationRow(row)
                        ? 'bg-amber-50/70'
                        : (row.flagged ?? isFakeDepositRow(row))
                          ? 'bg-red-50/60'
                          : ''
                    }`}
                  >
                    {canOperate && (
                      <td className="px-2 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.some((s) => s.transactionId === row.transactionId)}
                          onChange={() => toggleRow(row)}
                          disabled={!rowSelectableForBulk(row)}
                          title={rowSelectableForBulk(row) ? 'Include in bulk send' : 'Not eligible for bulk'}
                          className="rounded border-gray-400"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setWalletUserId(row.customerId)}
                        className="text-left text-gray-800 font-medium hover:text-[#147341] hover:underline"
                        title="Open user wallet"
                      >
                        {row.customerName}
                      </button>
                    </td>
                    <td className="px-4 py-3">{statusPill(row.status)}</td>
                    <td className="px-4 py-3">{flagBadge(row)}</td>
                    <td className="px-4 py-3">{masterWalletBadge(row.masterWalletStatus)}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs" title={row.txHash}>{truncateHash(row.txHash)}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{formatCryptoAmountFromUnknown(row.amount)} {row.currency}</td>
                    <td className="px-4 py-3 text-gray-600">${addThousandSeparator(Number(row.amountUsd) || 0)}</td>
                    <td className="px-4 py-3">
                      {(() => {
                        const sold = formatSoldCell(row);
                        return (
                          <div>
                            <p className="text-amber-800 font-medium">{sold.usd}</p>
                            {sold.crypto && (
                              <p className="text-xs text-gray-500" title="Crypto sold on platform after this deposit">
                                {sold.crypto}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-gray-600" title="Receive USD minus sold (same deposit window)">
                      {formatUsdCell(row.userRetentionUsd)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{row.blockchain}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(row.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => openDetails(row)}
                          className="text-[#147341] font-medium hover:underline"
                        >
                          View
                        </button>
                        {canOperate && (
                          <>
                            <button
                              type="button"
                              onClick={() => openDisburseFromRow(row)}
                              disabled={!rowSelectableForBulk(row)}
                              title={
                                rowSelectableForBulk(row)
                                  ? 'Disburse from deposit: vendor or master wallet'
                                  : 'Only successful receives not already disbursed or transferred to master'
                              }
                              className="text-[#147341] font-medium hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                            >
                              Disburse
                            </button>
                            <button
                              type="button"
                              onClick={() => { setSelectedTx(row); setSwapOpen(true); }}
                              disabled={!rowSwappableForChangeNow(row)}
                              title={
                                rowSwappableForChangeNow(row)
                                  ? 'Swap this in-wallet receive via ChangeNOW'
                                  : 'Swap is only available for successful receives currently in wallet'
                              }
                              className="text-[#147341] font-medium hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                            >
                              Swap
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Page {page} of {totalPages} ({total} total)</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {token && (
        <UserWalletDetailModal
          isOpen={walletUserId != null}
          userId={walletUserId}
          token={token}
          onClose={() => setWalletUserId(null)}
        />
      )}

      <TrackingDetailsModal
        isOpen={detailsOpen}
        onClose={() => { setDetailsOpen(false); setSelectedTx(null); }}
        steps={steps}
        details={details ?? null}
        onOpenSendToVendor={canOperate && selectedTx && isOnChainDepositRow(selectedTx) ? openSendToVendorModal : undefined}
        onOpenSendToMaster={canOperate && selectedTx && isOnChainDepositRow(selectedTx) ? openSendToMasterModal : undefined}
        onOpenSwapChangeNow={canOperate && selectedTx && rowSwappableForChangeNow(selectedTx) ? () => setSwapOpen(true) : undefined}
      />

      {canOperate && selectedTx && token && (
        <ReceivedAssetDispositionModal
          isOpen={dispositionOpen}
          onClose={() => setDispositionOpen(false)}
          transactionId={selectedTx.transactionId}
          symbol={details?.currency ?? selectedTx.currency}
          blockchain={details?.blockchain ?? selectedTx.blockchain}
          fullReceiveAmount={`${formatCryptoAmountFromUnknown(details?.amount ?? selectedTx.amount)} ${details?.currency ?? selectedTx.currency}`}
          receiveAmountUsd={details?.amountUsd ?? selectedTx.amountUsd}
          soldAmount={details?.soldAmount ?? selectedTx.soldAmount}
          soldAmountUsd={details?.soldAmountUsd ?? selectedTx.soldAmountUsd}
          userRetentionUsd={details?.userRetentionUsd ?? selectedTx.userRetentionUsd}
          initialOnChainBalance={details?.onChainDepositBalance ?? selectedTx.onChainDepositBalance}
          vendors={vendorsForDisposition}
          token={token}
          canSubmit={canSendToVendor}
          blockReason={sendToVendorBlockReason}
          defaultTab={dispositionDefaultTab}
        />
      )}

      {canOperate && token && (
        <BulkSendToVendorModal
          isOpen={bulkOpen}
          onClose={() => { setBulkOpen(false); setSelectedRows([]); }}
          rows={selectedRows}
          vendors={vendorsForDisposition}
          token={token}
        />
      )}
      {canOperate && selectedTx && token && (
        <ChangeNowCreateSwapModal
          isOpen={swapOpen}
          onClose={() => setSwapOpen(false)}
          token={token}
          sourceType="received_asset"
          receiveTransactionId={selectedTx.transactionId}
          receiveAmount={formatCryptoAmountFromUnknown(details?.amount ?? selectedTx.amount)}
          receiveCurrency={details?.currency ?? selectedTx.currency}
          receiveBlockchain={details?.blockchain ?? selectedTx.blockchain}
          lockSourceAsset
        />
      )}
    </div>
  );
};

export default TransactionTrackingPage;
