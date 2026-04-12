import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiSearch } from 'react-icons/fi';
import { useAuth } from '@renderer/context/authContext';
import TrackingDetailsModal from '@renderer/components/modal/TrackingDetailsModal';
import ReceivedAssetDispositionModal, {
  type DispositionModalTab,
} from '@renderer/components/modal/ReceivedAssetDispositionModal';
import BulkSendToVendorModal from '@renderer/components/modal/BulkSendToVendorModal';
import ChangeNowCreateSwapModal from '@renderer/components/modal/ChangeNowCreateSwapModal';
import {
  getTransactionTrackingList,
  getTransactionTrackingSteps,
  getTransactionTrackingDetails,
} from '@renderer/api/admin/transactionTracking';
import { getAdminVendors } from '@renderer/api/admin/vendors';
import type { SendModalVendor } from '@renderer/components/modal/SendCryptoModal';
import type { TrackingListItem } from '@renderer/data/transactionTrackingData';

function dateRangeToStartEnd(dateRange: string): { startDate?: string; endDate?: string } {
  const end = new Date();
  const start = new Date();
  if (dateRange === 'Last 7 days') start.setDate(end.getDate() - 7);
  else if (dateRange === 'Last 90 days') start.setDate(end.getDate() - 90);
  else start.setDate(end.getDate() - 30);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function masterWalletBadge(status: string) {
  const s = (status || 'unknown').toLowerCase();
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

function statusPill(status: string) {
  const s = status.toLowerCase();
  const isSuccess = s === 'successful';
  const isPending = s === 'pending' || s === 'processing';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isSuccess ? 'bg-green-100 text-green-800' : isPending ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-green-600' : isPending ? 'bg-amber-600' : 'bg-red-600'}`} />
      {status}
    </span>
  );
}

function truncateHash(hash: string, chars = 8) {
  if (!hash || hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

/** Bulk guide: prefer successful receives not already disbursed / transferred (server validates too). */
function rowSelectableForBulk(row: TrackingListItem): boolean {
  const st = (row.status || '').toLowerCase();
  if (st !== 'successful') return false;
  const m = (row.masterWalletStatus || '').toLowerCase().replace(/\s/g, '');
  if (m === 'senttovendor' || m === 'transferredtomaster') return false;
  return true;
}

/** ChangeNOW swap is allowed from received assets currently in wallet. */
function rowSwappableForChangeNow(row: TrackingListItem): boolean {
  const st = (row.status || '').toLowerCase();
  if (st !== 'successful') return false;
  const m = (row.masterWalletStatus || '').toLowerCase().replace(/\s/g, '');
  return m === 'inwallet';
}

const TransactionTrackingPage: React.FC = () => {
  const { token } = useAuth();
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TrackingListItem | null>(null);
  const [dispositionOpen, setDispositionOpen] = useState(false);
  const [dispositionDefaultTab, setDispositionDefaultTab] = useState<DispositionModalTab>('vendor');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<TrackingListItem[]>([]);
  const { startDate, endDate } = useMemo(() => dateRangeToStartEnd(dateRange), [dateRange]);

  const { data: listData, isLoading } = useQuery({
    queryKey: ['admin-transaction-tracking', token, startDate, endDate, search, page],
    queryFn: () =>
      getTransactionTrackingList({
        token: token!,
        startDate,
        endDate,
        search: search || undefined,
        page,
        limit: 20,
      }),
    enabled: !!token,
  });

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
      <h1 className="text-[40px] font-normal text-gray-800">Track On-Chain Deposits</h1>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={dateRange}
          onChange={(e) => { setDateRange(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option>Last 30 days</option>
          <option>Last 7 days</option>
          <option>Last 90 days</option>
        </select>
        {selectedRows.length > 0 && (
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
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search tx hash, address, name..."
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium">
                <th className="px-2 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={list.length > 0 && list.filter(rowSelectableForBulk).every((r) => selectedRows.some((s) => s.transactionId === r.transactionId)) && list.filter(rowSelectableForBulk).length > 0}
                    onChange={togglePage}
                    title="Select eligible rows on this page"
                    className="rounded border-gray-400"
                  />
                </th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Master Wallet</th>
                <th className="px-4 py-3">TX Hash</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">USD Value</th>
                <th className="px-4 py-3">Blockchain</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right min-w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={10} className="p-6 text-center text-gray-500">Loading...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={10} className="p-6 text-center text-gray-500">No on-chain deposits found.</td></tr>
              ) : (
                list.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                    <td className="px-4 py-3 text-gray-800 font-medium">{row.customerName}</td>
                    <td className="px-4 py-3">{statusPill(row.status)}</td>
                    <td className="px-4 py-3">{masterWalletBadge(row.masterWalletStatus)}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs" title={row.txHash}>{truncateHash(row.txHash)}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{row.amount} {row.currency}</td>
                    <td className="px-4 py-3 text-gray-600">${row.amountUsd}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{row.blockchain}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(row.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => openDetails(row)}
                          className="text-[#147341] font-medium hover:underline"
                        >
                          View
                        </button>
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

      <TrackingDetailsModal
        isOpen={detailsOpen}
        onClose={() => { setDetailsOpen(false); setSelectedTx(null); }}
        steps={steps}
        details={details ?? null}
        onOpenSendToVendor={selectedTx ? openSendToVendorModal : undefined}
        onOpenSendToMaster={selectedTx ? openSendToMasterModal : undefined}
        onOpenSwapChangeNow={selectedTx ? () => setSwapOpen(true) : undefined}
      />

      {selectedTx && token && (
        <ReceivedAssetDispositionModal
          isOpen={dispositionOpen}
          onClose={() => setDispositionOpen(false)}
          transactionId={selectedTx.transactionId}
          symbol={details?.currency ?? selectedTx.currency}
          blockchain={details?.blockchain ?? selectedTx.blockchain}
          fullReceiveAmount={details?.amount ?? selectedTx.amount}
          vendors={vendorsForDisposition}
          token={token}
          canSubmit={canSendToVendor}
          blockReason={sendToVendorBlockReason}
          defaultTab={dispositionDefaultTab}
        />
      )}

      {token && (
        <BulkSendToVendorModal
          isOpen={bulkOpen}
          onClose={() => { setBulkOpen(false); setSelectedRows([]); }}
          rows={selectedRows}
          vendors={vendorsForDisposition}
          token={token}
        />
      )}
      {selectedTx && token && (
        <ChangeNowCreateSwapModal
          isOpen={swapOpen}
          onClose={() => setSwapOpen(false)}
          token={token}
          sourceType="received_asset"
          receiveTransactionId={selectedTx.transactionId}
          receiveAmount={String(details?.amount ?? selectedTx.amount)}
          receiveCurrency={details?.currency ?? selectedTx.currency}
          receiveBlockchain={details?.blockchain ?? selectedTx.blockchain}
          lockSourceAsset
        />
      )}
    </div>
  );
};

export default TransactionTrackingPage;
