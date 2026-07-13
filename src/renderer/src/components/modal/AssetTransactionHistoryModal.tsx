import React, { useMemo, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import {
  DATE_RANGE_PRESETS,
  type DateRangePreset,
  matchesDateRange,
  resolveDateFilters,
} from '@renderer/utils/dateRange';
import { formatCryptoAmountFromUnknown } from '@renderer/utils/cryptoAmountSync';

function normalizeTxStatus(raw: string): 'successful' | 'pending' | 'failed' {
  const s = String(raw ?? '').toLowerCase();
  if (s === 'successful' || s === 'success' || s === 'completed') return 'successful';
  if (s === 'failed' || s === 'failure' || s === 'error') return 'failed';
  return 'pending';
}

function formatTxType(type: string): string {
  const t = String(type ?? '').toLowerCase();
  if (t === 'send') return 'Disburse';
  if (t === 'customer_send') return 'Customer send';
  if (t === 'swap') return 'Swap';
  if (t === 'changenow_payin') return 'Exchange (ChangeNOW)';
  if (t === 'gas_topup_vendor_disbursement') return 'Gas top-up';
  if (t === 'sweep') return 'Sweep';
  return type || '—';
}

function formatPerformer(performedBy?: { name: string; role: string }): string {
  if (!performedBy?.name) return '—';
  return performedBy.role ? `${performedBy.name} (${performedBy.role})` : performedBy.name;
}

type StatusFilter = 'all' | 'successful' | 'pending' | 'failed';

interface TxRow {
  id: number;
  to: string;
  status: 'successful' | 'pending' | 'failed';
  type: string;
  wallet: string;
  amount: string;
  date: string;
  txHash?: string;
  performedBy?: { userId: number; name: string; role: string };
  vendor?: { id: number; name: string };
}

interface AssetTransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetSymbol: string;
  transactions?: TxRow[];
  walletLabel?: string;
  loading?: boolean;
  /** Scroll/highlight a row after a new disburse. */
  highlightTxId?: number | null;
}

const AssetTransactionHistoryModal: React.FC<AssetTransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  assetSymbol,
  transactions = [],
  walletLabel,
  loading = false,
  highlightTxId = null,
}) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateRange, setDateRange] = useState<DateRangePreset | string>('All');
  const [search, setSearch] = useState('');

  const { startDate, endDate } = useMemo(
    () => resolveDateFilters({ dateRange }),
    [dateRange]
  );

  if (!isOpen) return null;

  const normalized = transactions.map((tx) => ({
    ...tx,
    status: normalizeTxStatus(tx.status),
  }));

  const filtered = normalized.filter((tx) => {
    const matchStatus = statusFilter === 'all' || tx.status === statusFilter;
    const matchType =
      typeFilter === 'All' || formatTxType(tx.type) === typeFilter || tx.type === typeFilter;
    const matchSearch =
      !search ||
      tx.to.toLowerCase().includes(search.toLowerCase()) ||
      formatPerformer(tx.performedBy).toLowerCase().includes(search.toLowerCase()) ||
      (tx.vendor?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchDate = matchesDateRange(tx.date, startDate, endDate);
    return matchStatus && matchType && matchSearch && matchDate;
  });

  const statusClass = (s: string) => {
    if (s === 'successful') return 'bg-green-100 text-green-700 border-green-500';
    if (s === 'pending') return 'bg-orange-100 text-orange-700 border-orange-500';
    return 'bg-red-100 text-red-700 border-red-500';
  };

  const dotClass = (s: string) => {
    if (s === 'successful') return 'bg-green-600';
    if (s === 'pending') return 'bg-orange-500';
    return 'bg-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {assetSymbol} Transaction History{walletLabel ? ` (${walletLabel})` : ''}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Close">
            &times;
          </button>
        </div>
        <div className="p-4 border-b space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'successful', 'pending', 'failed'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 text-sm font-medium rounded-md capitalize ${
                  statusFilter === s ? 'bg-[#147341] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
            >
              <option>All</option>
              <option>Disburse</option>
              <option>Customer send</option>
              <option>Swap</option>
              <option>Exchange (ChangeNOW)</option>
              <option>Gas top-up</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
            >
              <option value="All">All</option>
              {DATE_RANGE_PRESETS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 ml-auto w-48">
              <FiSearch className="h-4 w-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="outline-none text-sm w-full"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="py-3 px-4 text-left">Performed by</th>
                <th className="py-3 px-4 text-left">To</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Wallet</th>
                <th className="py-3 px-4 text-left">Amount</th>
                <th className="py-3 px-4 text-left">Tx hash</th>
                <th className="py-3 px-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-t animate-pulse">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((tx) => (
                <tr
                  key={tx.id}
                  className={`border-t hover:bg-gray-50 ${
                    highlightTxId != null && tx.id === highlightTxId ? 'bg-green-50 ring-1 ring-inset ring-[#147341]' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-gray-700 whitespace-nowrap" title={formatPerformer(tx.performedBy)}>
                    {formatPerformer(tx.performedBy)}
                  </td>
                  <td className="py-3 px-4 font-medium max-w-[140px] truncate" title={tx.to}>
                    {tx.to}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${statusClass(tx.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dotClass(tx.status)}`} />
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{formatTxType(tx.type)}</td>
                  <td className="py-3 px-4">{tx.wallet}</td>
                  <td className="py-3 px-4">{formatCryptoAmountFromUnknown(tx.amount)}</td>
                  <td className="py-3 px-4 font-mono text-xs max-w-[120px] truncate" title={tx.txHash}>
                    {tx.txHash ? `${tx.txHash.slice(0, 8)}…${tx.txHash.slice(-6)}` : '—'}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">{tx.date ? new Date(tx.date).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetTransactionHistoryModal;
