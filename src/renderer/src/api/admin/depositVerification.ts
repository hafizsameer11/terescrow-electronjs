import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

export type DepositVerificationStatus = 'pending' | 'verified' | 'mismatch' | 'failed' | string;

export interface DepositVerificationLog {
  id: number;
  txHash: string;
  chain: string;
  userId: number;
  userEmail: string | null;
  userName: string | null;
  virtualAccountId: number;
  status: DepositVerificationStatus;
  attempts: number;
  nextRetryAt: string | null;
  webhookAmount: string | null;
  onChainAmount: string | null;
  contractAddress: string | null;
  depositAddress: string | null;
  provider: string | null;
  failureReason: string | null;
  failureReasonLabel?: string | null;
  failureReasonDetail?: string | null;
  rejectionStage?: string | null;
  rejectionCode?: string | null;
  currency: string | null;
  receivedAssetId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepositVerificationLogDetail extends DepositVerificationLog {
  accountId: string | null;
  rawSnippet: unknown;
  payload: Record<string, unknown> | null;
}

export interface DepositVerificationLogsResponse {
  verifyEnabled: boolean;
  workerQueue: string;
  workerJob: string;
  countsByStatus: Record<string, number>;
  items: DepositVerificationLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getDepositVerificationLogs(
  token: string,
  params: { page?: number; limit?: number; status?: string; search?: string } = {}
): Promise<DepositVerificationLogsResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  if (params.search?.trim()) qs.set('search', params.search.trim());
  const url = `${API_ENDPOINT.ADMIN.depositVerificationLogs}?${qs.toString()}`;
  const res = await apiCall(url, 'GET', undefined, token);
  const data = (res as { data?: DepositVerificationLogsResponse })?.data;
  return (
    data ?? {
      verifyEnabled: false,
      workerQueue: 'default',
      workerJob: 'retry-deposit-verification',
      countsByStatus: {},
      items: [],
      total: 0,
      page: 1,
      limit: 25,
      totalPages: 1,
    }
  );
}

export async function getDepositVerificationLogDetail(
  token: string,
  id: number
): Promise<DepositVerificationLogDetail | null> {
  const res = await apiCall(API_ENDPOINT.ADMIN.depositVerificationLog(id), 'GET', undefined, token);
  return ((res as { data?: DepositVerificationLogDetail })?.data ?? null) as DepositVerificationLogDetail | null;
}

export async function retryDepositVerification(token: string, id: number): Promise<void> {
  await apiCall(API_ENDPOINT.ADMIN.depositVerificationRetry(id), 'POST', {}, token);
}
