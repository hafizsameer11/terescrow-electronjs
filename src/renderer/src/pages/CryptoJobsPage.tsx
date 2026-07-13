import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@renderer/context/authContext';
import { getFailedCryptoJobs, retryCryptoJob } from '@renderer/api/admin/cryptoJobs';

const CryptoJobsPage: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-crypto-jobs-failed', token],
    queryFn: () => getFailedCryptoJobs(token!),
    enabled: !!token,
  });

  const retryMutation = useMutation({
    mutationFn: (body: { queueName: string; jobId: string }) => retryCryptoJob(token!, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-crypto-jobs-failed'] }),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[40px] font-normal text-gray-800">Crypto jobs</h1>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      <p className="text-sm text-gray-600">
        Failed Bull queue jobs (Tatum, bill payments). Retry re-queues the job for processing.
      </p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-600">
              <th className="px-4 py-3">Queue</th>
              <th className="px-4 py-3">Job</th>
              <th className="px-4 py-3">Failed at</th>
              <th className="px-4 py-3">Attempts</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b animate-pulse">
                  <td colSpan={6} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </td>
                </tr>
              ))}
            {!isLoading && jobs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No failed jobs in known queues
                </td>
              </tr>
            )}
            {!isLoading &&
              jobs.map((j) => (
                <tr key={`${j.queueName}-${j.id}`} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{j.queueName}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{j.name}</span>
                    <span className="text-gray-400 ml-1">#{j.id}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{j.failedAt ? new Date(j.failedAt).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3">{j.attemptsMade}</td>
                  <td className="px-4 py-3 text-red-700 max-w-md truncate" title={j.failedReason ?? ''}>
                    {j.failedReason ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={retryMutation.isPending}
                      onClick={() => retryMutation.mutate({ queueName: j.queueName, jobId: j.id })}
                      className="text-[#147341] hover:underline disabled:opacity-50"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CryptoJobsPage;
