import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@renderer/context/authContext';
import {
  getChangeNowPartnerExchanges,
  getChangeNowSwapById,
  getChangeNowSwaps,
  refreshChangeNowSwap,
} from '@renderer/api/admin/changenow';
import { changenowSourceTypeLabel } from '@renderer/api/admin/changenow';
import { swapBadgeKind, type SwapOrder } from '@renderer/types/changenow';

type TabId = 'swaps' | 'partner';

function SwapStatusPill({ status }: { status: string }) {
  const kind = swapBadgeKind(status);
  const cls =
    kind === 'completed'
      ? 'bg-green-100 text-green-800'
      : kind === 'problem'
        ? 'bg-red-100 text-red-800'
        : 'bg-amber-100 text-amber-800';
  const label = kind === 'completed' ? 'Completed' : kind === 'problem' ? 'Problem' : 'Processing';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}

const ChangeNowSwapsPage: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('swaps');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selectedSwapId, setSelectedSwapId] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);

  const { data: swapList, isLoading: swapLoading } = useQuery({
    queryKey: ['admin-changenow-swaps', token, status, page],
    queryFn: () => getChangeNowSwaps(token!, { page, limit: 20, status: status || undefined }),
    enabled: !!token && tab === 'swaps',
  });

  const { data: selectedSwap, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-changenow-swap-by-id', token, selectedSwapId],
    queryFn: () => getChangeNowSwapById(token!, selectedSwapId!),
    enabled: !!token && !!selectedSwapId,
  });

  const refreshMutation = useMutation({
    mutationFn: (swapId: number) => refreshChangeNowSwap(token!, swapId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-changenow-swaps'] });
      if (selectedSwapId) queryClient.invalidateQueries({ queryKey: ['admin-changenow-swap-by-id', token, selectedSwapId] });
    },
  });

  const { data: partnerData, isLoading: partnerLoading } = useQuery({
    queryKey: ['admin-changenow-partner-exchanges', token, offset],
    queryFn: () => getChangeNowPartnerExchanges(token!, { limit: 20, offset, sortDirection: 'DESC', sortField: 'createdAt' }),
    enabled: !!token && tab === 'partner',
  });

  const swaps = swapList?.items ?? [];
  const partnerRows = partnerData?.items ?? [];

  const swapCountText = useMemo(() => {
    const total = swapList?.total ?? 0;
    if (total === 0) return 'No swaps found';
    return `${total} swaps`;
  }, [swapList?.total]);

  return (
    <div className="p-6 space-y-6 w-full">
      <h1 className="text-[40px] text-gray-800 font-normal">ChangeNOW Swaps</h1>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTab('swaps')}
          className={`px-4 py-2 rounded-lg font-medium ${tab === 'swaps' ? 'bg-[#147341] text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Swaps
        </button>
        <button
          type="button"
          onClick={() => setTab('partner')}
          className={`px-4 py-2 rounded-lg font-medium ${tab === 'partner' ? 'bg-[#147341] text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Partner Exchanges
        </button>
      </div>

      {tab === 'swaps' && (
        <>
          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All status</option>
              <option value="awaiting_payin">awaiting_payin</option>
              <option value="payin_broadcast">payin_broadcast</option>
              <option value="exchanging">exchanging</option>
              <option value="completed">completed</option>
              <option value="failed">failed</option>
              <option value="refunded">refunded</option>
            </select>
            <span className="text-sm text-gray-500">{swapCountText}</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Pair</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {swapLoading ? (
                    <tr><td colSpan={7} className="p-6 text-center text-gray-500">Loading...</td></tr>
                  ) : swaps.length === 0 ? (
                    <tr><td colSpan={7} className="p-6 text-center text-gray-500">No swaps found.</td></tr>
                  ) : (
                    swaps.map((row: SwapOrder) => (
                      <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">#{row.id}</td>
                        <td className="px-4 py-3 text-gray-700">{changenowSourceTypeLabel(row.sourceType)}</td>
                        <td className="px-4 py-3 text-gray-700 uppercase">{row.fromTicker} → {row.toTicker}</td>
                        <td className="px-4 py-3 text-gray-700">{row.amountFrom}</td>
                        <td className="px-4 py-3"><SwapStatusPill status={row.status} /></td>
                        <td className="px-4 py-3 text-gray-600">{new Date(row.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSwapId(row.id)}
                            className="text-[#147341] font-medium hover:underline"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => refreshMutation.mutate(row.id)}
                            className="text-[#147341] font-medium hover:underline"
                          >
                            Refresh
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Page {swapList?.page ?? 1} of {swapList?.totalPages ?? 1}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={(swapList?.page ?? 1) <= 1}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(swapList?.totalPages ?? 1, p + 1))}
                disabled={(swapList?.page ?? 1) >= (swapList?.totalPages ?? 1)}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {tab === 'partner' && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium">
                    <th className="px-4 py-3">Request ID</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">From</th>
                    <th className="px-4 py-3">To</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {partnerLoading ? (
                    <tr><td colSpan={5} className="p-6 text-center text-gray-500">Loading...</td></tr>
                  ) : partnerRows.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-gray-500">No partner exchanges found.</td></tr>
                  ) : (
                    partnerRows.map((row: any, idx: number) => (
                      <tr key={String(row.id ?? row.requestId ?? idx)} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-800 font-medium">{String(row.requestId ?? row.id ?? '—')}</td>
                        <td className="px-4 py-3 text-gray-700">{String(row.status ?? '—')}</td>
                        <td className="px-4 py-3 text-gray-700">{String(row.fromCurrency ?? row.from ?? '—')}</td>
                        <td className="px-4 py-3 text-gray-700">{String(row.toCurrency ?? row.to ?? '—')}</td>
                        <td className="px-4 py-3 text-gray-600">{row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOffset((o) => Math.max(0, o - 20))}
              disabled={offset <= 0}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setOffset((o) => o + 20)}
              className="px-3 py-1 rounded border border-gray-300"
            >
              Next
            </button>
          </div>
        </>
      )}

      {selectedSwapId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Swap details #{selectedSwapId}</h2>
              <button type="button" onClick={() => setSelectedSwapId(null)} className="text-2xl text-gray-500">&times;</button>
            </div>
            <div className="p-4 text-sm">
              {detailLoading || !selectedSwap ? (
                <p className="text-gray-500">Loading details...</p>
              ) : (
                <div className="space-y-2">
                  <p><span className="text-gray-500">Source:</span> {changenowSourceTypeLabel(selectedSwap.sourceType)}</p>
                  <p><span className="text-gray-500">Status:</span> {selectedSwap.status} ({selectedSwap.changenowStatus ?? '—'})</p>
                  <p><span className="text-gray-500">Pair:</span> {selectedSwap.fromTicker} → {selectedSwap.toTicker}</p>
                  <p><span className="text-gray-500">Amount:</span> {selectedSwap.amountFrom}</p>
                  <p><span className="text-gray-500">Expected receive:</span> {selectedSwap.expectedAmountTo ?? '—'}</p>
                  <p className="break-all"><span className="text-gray-500">Pay-in address:</span> {selectedSwap.payinAddress}</p>
                  <p className="break-all"><span className="text-gray-500">Payout address:</span> {selectedSwap.payoutAddress}</p>
                  <p className="break-all"><span className="text-gray-500">Outbound tx:</span> {selectedSwap.outboundTxHash ?? '—'}</p>
                  <p className="break-all"><span className="text-gray-500">Pay-in hash:</span> {selectedSwap.payinHash ?? '—'}</p>
                  <p className="break-all"><span className="text-gray-500">Payout hash:</span> {selectedSwap.payoutHash ?? '—'}</p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => refreshMutation.mutate(selectedSwap.id)}
                      className="px-3 py-1.5 bg-[#147341] text-white rounded"
                    >
                      Refresh now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeNowSwapsPage;
