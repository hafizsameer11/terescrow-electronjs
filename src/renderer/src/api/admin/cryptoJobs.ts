import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

export type FailedCryptoJob = {
  id: string;
  queueName: string;
  name: string;
  failedAt: string | null;
  attemptsMade: number;
  data: unknown;
  failedReason: string | null;
};

export async function getFailedCryptoJobs(token: string, limit = 50): Promise<FailedCryptoJob[]> {
  const res = await apiCall(`${API_ENDPOINT.ADMIN.cryptoJobsFailed}?limit=${limit}`, 'GET', undefined, token);
  const data = (res as any)?.data;
  return data?.items ?? [];
}

export async function retryCryptoJob(
  token: string,
  body: { queueName: string; jobId: string }
): Promise<void> {
  await apiCall(API_ENDPOINT.ADMIN.cryptoJobsRetry, 'POST', body, token);
}
