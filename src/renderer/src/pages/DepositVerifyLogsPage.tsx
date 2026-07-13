import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@renderer/context/authContext';
import {
  getDepositVerificationLogDetail,
  getDepositVerificationLogs,
  retryDepositVerification,
  type DepositVerificationLog,
} from '@renderer/api/admin/depositVerification';
import { useDebouncedValue } from '@renderer/utils/useDebouncedValue';
import {
  formatRejectionDetail,
  formatRejectionLabel,
  isDefinitiveRejection,
  verifyStatusBadgeClass,
  verifyStatusLabel,
} from '@renderer/utils/depositRejectionReasons';
import { extractOnChainRecipients } from '@renderer/utils/depositVerifySnippet';

function displayFailure(row: {
  failureReason?: string | null;
  failureReasonLabel?: string | null;
  rejectionCode?: string | null;
}): string {
  return row.failureReasonLabel || formatRejectionLabel(row.rejectionCode ?? row.failureReason);
}

const DepositVerifyLogsPage: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-deposit-verify-logs', token, page, statusFilter, debouncedSearch],
    queryFn: () =>
      getDepositVerificationLogs(token!, {
        page,
        limit: 25,
        status: statusFilter,
        search: debouncedSearch,
      }),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const { data: detail, refetch: refetchDetail } = useQuery({
    queryKey: ['admin-deposit-verify-detail', token, selectedId],
    queryFn: () => getDepositVerificationLogDetail(token!, selectedId!),
    enabled: !!token && selectedId != null,
    refetchInterval: (query) => {
      const st = query.state.data?.status;
      return st === 'pending' ? 8_000 : false;
    },
  });

  const retryMutation = useMutation({
    mutationFn: (id: number) => retryDepositVerification(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-deposit-verify-logs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-deposit-verify-detail'] });
      void refetchDetail();
    },
  });

  const counts = data?.countsByStatus ?? {};
  const pendingCount = counts.pending ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[40px] font-normal text-gray-800">Deposit verify logs</h1>
          <p className="text-sm text-gray-600 mt-1">
            On-chain double-check worker — queue <span className="font-mono">{data?.workerQueue ?? 'default'}</span>
            {' / '}
            job <span className="font-mono">{data?.workerJob ?? 'retry-deposit-verification'}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
        >
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase">Verify enabled</p>
          <p className={`text-lg font-semibold ${data?.verifyEnabled ? 'text-green-700' : 'text-red-700'}`}>
            {data?.verifyEnabled ? 'Yes' : 'No'}
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-800 uppercase">Checking</p>
          <p className="text-lg font-semibold text-amber-900">{pendingCount}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs text-green-800 uppercase">Verified</p>
          <p className="text-lg font-semibold text-green-900">{counts.verified ?? 0}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-red-800 uppercase">Rejected / fraud</p>
          <p className="text-lg font-semibold text-red-900">
            {(counts.rejected ?? 0) + (counts.mismatch ?? 0)}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-xs text-orange-800 uppercase">Failed / timeout</p>
          <p className="text-lg font-semibold text-orange-900">{counts.failed ?? 0}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search tx hash, address, chain…"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[220px] flex-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All statuses</option>
          <option value="pending">Checking</option>
          <option value="verified">Verified</option>
          <option value="mismatch">Fraud confirmed</option>
          <option value="rejected">Rejected (scam guard)</option>
          <option value="failed">Failed / timeout</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-600">
              <th className="px-4 py-3">Tx hash</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Chain</th>
              <th className="px-4 py-3">Webhook / on-chain</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Attempts</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Next retry</th>
              <th className="px-4 py-3 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b animate-pulse">
                  <td colSpan={9} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </td>
                </tr>
              ))}
            {!isLoading && (data?.items ?? []).length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                  No deposit verification logs yet
                </td>
              </tr>
            )}
            {!isLoading &&
              (data?.items ?? []).map((row: DepositVerificationLog) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${row.status === 'pending' ? 'bg-amber-50/40' : ''}`}
                >
                  <td className="px-4 py-3 font-mono text-xs max-w-[140px] truncate" title={row.txHash}>
                    {row.txHash}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{row.userName ?? `User #${row.userId}`}</div>
                    <div className="text-xs text-gray-500">{row.userEmail ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    {row.chain}
                    {row.currency ? <span className="text-gray-400 ml-1">({row.currency})</span> : null}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div>W: {row.webhookAmount ?? '—'}</div>
                    <div className="text-gray-500">C: {row.onChainAmount ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${verifyStatusBadgeClass(row.status, row.rejectionCode)}`}
                    >
                      {verifyStatusLabel(row.status, {
                        rejectionCode: row.rejectionCode,
                        nextRetryAt: row.nextRetryAt,
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">{row.attempts}</td>
                  <td className="px-4 py-3 text-xs max-w-[200px]">
                    <div className="font-medium text-gray-800">{displayFailure(row)}</div>
                    {row.rejectionStage && (
                      <div className="text-gray-500 capitalize">{row.rejectionStage.replace(/_/g, ' ')}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {row.nextRetryAt ? new Date(row.nextRetryAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-[#147341] hover:underline"
                      onClick={() => setSelectedId(row.id)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {(data?.totalPages ?? 1) > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {data?.page ?? 1} of {data?.totalPages ?? 1} ({data?.total ?? 0} total)
          </span>
          <button
            type="button"
            disabled={page >= (data?.totalPages ?? 1)}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {selectedId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b px-6 py-4 bg-gray-50/80">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Verification details</h2>
                <p className="text-xs text-gray-500 mt-0.5">On-chain deposit double-check</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {detail ? (
              (() => {
                const onChainRecipients = extractOnChainRecipients(detail.rawSnippet, detail.chain);
                const definitive = isDefinitiveRejection(detail.status, detail.rejectionCode);
                const alertTone = definitive
                  ? 'border-red-200 bg-red-50 text-red-900'
                  : 'border-amber-200 bg-amber-50 text-amber-950';
                const displayCurrency =
                  detail.currency && detail.currency !== 'FAKE_TOKEN' && detail.currency !== 'UNKNOWN'
                    ? detail.currency
                    : detail.chain?.toUpperCase().includes('BITCOIN')
                      ? 'BTC'
                      : detail.currency ?? '—';

                return (
                  <div className="overflow-y-auto flex-1 p-6 space-y-5 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${verifyStatusBadgeClass(detail.status, detail.rejectionCode)}`}
                      >
                        {verifyStatusLabel(detail.status, {
                          rejectionCode: detail.rejectionCode,
                          nextRetryAt: detail.nextRetryAt,
                        })}
                      </span>
                      <span className="text-gray-500 text-xs">Attempt {detail.attempts}</span>
                      {detail.provider && (
                        <span className="text-gray-500 text-xs">via {detail.provider}</span>
                      )}
                      <span className="text-gray-400 text-xs ml-auto">
                        Updated {new Date(detail.updatedAt).toLocaleString()}
                      </span>
                    </div>

                    {(detail.failureReasonLabel || detail.failureReason) && (
                      <div className={`rounded-xl border p-4 space-y-1.5 ${alertTone}`}>
                        <p className="font-semibold">
                          {detail.failureReasonLabel || displayFailure(detail)}
                        </p>
                        <p className="text-sm leading-relaxed opacity-90">
                          {detail.failureReasonDetail
                            || formatRejectionDetail(detail.rejectionCode ?? detail.failureReason)}
                        </p>
                      </div>
                    )}

                    {onChainRecipients.length > 0 && detail.depositAddress && (
                      <div className="rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-2.5 bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Address comparison
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Expected deposit address</p>
                            <p className="font-mono text-xs break-all text-[#147341] bg-green-50 px-2 py-1.5 rounded-lg">
                              {detail.depositAddress}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">On-chain outputs (actual recipients)</p>
                            <ul className="space-y-1.5">
                              {onChainRecipients.map((r) => {
                                const matches =
                                  r.address.toLowerCase() === detail.depositAddress!.toLowerCase();
                                return (
                                  <li
                                    key={r.address}
                                    className={`font-mono text-xs break-all px-2 py-1.5 rounded-lg ${
                                      matches
                                        ? 'bg-green-50 text-green-900'
                                        : 'bg-red-50 text-red-900'
                                    }`}
                                  >
                                    {r.address}
                                    <span className="text-gray-600 ml-2">
                                      ({r.amount} {r.unit})
                                    </span>
                                    {!matches && (
                                      <span className="ml-2 text-red-700 font-sans font-medium">
                                        ≠ deposit address
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      <Field label="Tx hash" value={detail.txHash} mono />
                      <Field label="Chain / currency" value={`${detail.chain} · ${displayCurrency}`} />
                      <Field
                        label="User"
                        value={`${detail.userName ?? `User #${detail.userId}`}${detail.userEmail ? ` · ${detail.userEmail}` : ''}`}
                      />
                      <Field label="Webhook amount" value={detail.webhookAmount ?? '—'} />
                      <Field label="On-chain amount" value={detail.onChainAmount ?? '—'} />
                      <Field
                        label="Next retry"
                        value={detail.nextRetryAt ? new Date(detail.nextRetryAt).toLocaleString() : '—'}
                      />
                      {!onChainRecipients.length && detail.depositAddress && (
                        <Field label="Deposit address" value={detail.depositAddress} mono className="sm:col-span-2" />
                      )}
                    </div>

                    {detail.rawSnippet != null && (
                      <details className="group rounded-xl border border-gray-200">
                        <summary className="cursor-pointer px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide hover:bg-gray-50">
                          Raw API response
                        </summary>
                        <pre className="border-t bg-gray-950 text-gray-100 p-4 text-xs overflow-x-auto max-h-56 font-mono">
                          {JSON.stringify(detail.rawSnippet, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="p-10 text-center text-gray-500">Loading…</div>
            )}
            {detail && (
              <div className="border-t px-6 py-4 bg-gray-50/80 flex flex-wrap gap-3">
                {detail.status !== 'verified' && !isDefinitiveRejection(detail.status, detail.rejectionCode) && (
                  <button
                    type="button"
                    disabled={retryMutation.isPending}
                    onClick={() => retryMutation.mutate(detail.id)}
                    className="px-4 py-2 bg-[#147341] text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-[#0f5c34]"
                  >
                    {retryMutation.isPending ? 'Queuing…' : 'Retry verify now'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-white"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositVerifyLogsPage;

function Field({
  label,
  value,
  mono,
  className = '',
}: {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm text-gray-900 break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  );
}
