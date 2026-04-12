import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';
import type { TrackingListItem, TrackingStep, TrackingDetails } from '@renderer/data/transactionTrackingData';

export interface TransactionTrackingParams {
  token: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export async function getTransactionTrackingList(params: TransactionTrackingParams): Promise<{
  items: TrackingListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { token, startDate, endDate, search, page = 1, limit = 20 } = params;
  const sp = new URLSearchParams();
  if (startDate) sp.set('startDate', startDate);
  if (endDate) sp.set('endDate', endDate);
  if (search) sp.set('search', search);
  sp.set('page', String(page));
  sp.set('limit', String(limit));
  const url = `${API_ENDPOINT.ADMIN.transactionTracking}?${sp.toString()}`;
  const res = await apiCall(url, 'GET', undefined, token);
  return (res as any)?.data ?? { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
}

export async function getTransactionTrackingSteps(token: string, txId: string): Promise<TrackingStep[]> {
  const res = await apiCall(API_ENDPOINT.ADMIN.transactionTrackingSteps(txId), 'GET', undefined, token);
  const data = (res as any)?.data;
  return data?.steps ?? [];
}

export async function getTransactionTrackingDetails(token: string, txId: string): Promise<TrackingDetails | null> {
  const res = await apiCall(API_ENDPOINT.ADMIN.transactionTrackingDetails(txId), 'GET', undefined, token);
  return (res as any)?.data ?? null;
}

/** POST /transaction-tracking/:txId/send-to-vendor */
export type TransactionTrackingSendToVendorPayload = {
  vendorId: number;
  /** Omit to let the server use the full receive amount (recommended). If set, must equal full CryptoReceive amount. */
  amount?: string;
};

export type TransactionTrackingSendToVendorResult = {
  disbursementId?: number;
  txHash?: string;
  amount?: string;
  amountUsd?: string;
  toAddress?: string;
  vendorId?: number;
  networkFee?: string;
  gasFundingTxHash?: string;
};

export async function transactionTrackingSendToVendor(
  token: string,
  transactionId: string,
  payload: TransactionTrackingSendToVendorPayload
): Promise<TransactionTrackingSendToVendorResult> {
  const body: Record<string, unknown> = { vendorId: payload.vendorId };
  if (payload.amount != null && String(payload.amount).trim() !== '') {
    body.amount = String(payload.amount).trim();
  }
  const res = await apiCall(API_ENDPOINT.ADMIN.transactionTrackingSendToVendor(transactionId), 'POST', body, token);
  return (res as any)?.data ?? {};
}

/** POST /transaction-tracking/:txId/send-to-master-wallet — deposit key → platform master address for chain; ledger disbursementType master_wallet, vendorId null. */
export type TransactionTrackingSendToMasterWalletPayload = {
  /** Omit so the server uses the full receive amount. If set, must equal full CryptoReceive amount. */
  amount?: string;
};

export type TransactionTrackingSendToMasterWalletResult = {
  disbursementId?: number;
  txHash?: string;
  amount?: string;
  amountUsd?: string;
  toAddress?: string;
  networkFee?: string;
  gasFundingTxHash?: string;
};

export async function transactionTrackingSendToMasterWallet(
  token: string,
  transactionId: string,
  payload: TransactionTrackingSendToMasterWalletPayload = {}
): Promise<TransactionTrackingSendToMasterWalletResult> {
  const body: Record<string, unknown> = {};
  if (payload.amount != null && String(payload.amount).trim() !== '') {
    body.amount = String(payload.amount).trim();
  }
  const res = await apiCall(API_ENDPOINT.ADMIN.transactionTrackingSendToMasterWallet(transactionId), 'POST', body, token);
  return (res as any)?.data ?? {};
}

export type BulkSendToVendorItem = {
  receiveTransactionId: string;
  vendorId: number;
};

export type BulkSendToVendorResponse = {
  results: Array<{
    receiveTransactionId: string;
    success: boolean;
    data?: TransactionTrackingSendToVendorResult;
    error?: string;
    statusCode?: number;
  }>;
  summary: { total: number; succeeded: number; failed: number };
};

export async function transactionTrackingBulkSendToVendor(
  token: string,
  payload: { items: BulkSendToVendorItem[] }
): Promise<BulkSendToVendorResponse> {
  const res = await apiCall(API_ENDPOINT.ADMIN.transactionTrackingBulkSendToVendor, 'POST', payload, token);
  return (res as any)?.data ?? { results: [], summary: { total: 0, succeeded: 0, failed: 0 } };
}
