import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

type StatusFilter = 'all' | 'successful' | 'pending' | 'failed';

interface TxRow {
  id: number;
  to: string;
  status: 'successful' | 'pending' | 'failed';
  type: string;
  wallet: string;
  amount: string;
  date: string;
}

const MOCK_TXS: TxRow[] = [
  { id: 1, to: 'Alucard', status: 'successful', type: 'Crypto Send', wallet: 'Master Wallet', amount: '0.01BTC / $20,000', date: 'Nov 6, 2024' },
  { id: 2, to: 'Adam', status: 'pending', type: 'Crypto Send', wallet: 'Yellow Card', amount: '0.01BTC / $20,000', date: 'Nov 6, 2024' },
  { id: 3, to: 'Sasha', status: 'failed', type: 'Crypto Send', wallet: 'Yellow Card', amount: '0.01BTC / $20,000', date: 'Nov 6, 2024' },
];

interface AssetTransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetSymbol: string;
  transactions?: TxRow[];
  walletLabel?: string;
}

const AssetTransactionHistoryModal: React.FC<AssetTransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  assetSymbol,
  transactions = MOCK_TXS,
  walletLabel,
}) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = transactions.filter((tx) => {
    const matchStatus = statusFilter === 'all' || tx.status === statusFilter;
    const matchSearch = !search || tx.to.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
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
              <option>Crypto Send</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
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
                <th className="py-3 px-4 text-left">To</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Wallet</th>
                <th className="py-3 px-4 text-left">Amount</th>
                <th className="py-3 px-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{tx.to}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${statusClass(tx.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dotClass(tx.status)}`} />
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{tx.type}</td>
                  <td className="py-3 px-4">{tx.wallet}</td>
                  <td className="py-3 px-4">{tx.amount}</td>
                  <td className="py-3 px-4">{tx.date}</td>
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
