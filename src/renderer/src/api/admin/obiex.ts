import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

function unwrap<T>(res: unknown): T {
  return (res as { data?: T })?.data as T;
}

export type ObiexMarkupRange = {
  id: number;
  side: 'buy' | 'sell' | string;
  minUsd: number;
  maxUsd: number;
  percent: number;
  isActive: boolean;
  sortOrder: number;
};

export type ObiexStatus = {
  configured?: boolean;
  environment?: string;
  baseUrl?: string;
  apiKeyMasked?: string | null;
  webhookSecretConfigured?: boolean;
  settings: {
    isActive?: boolean;
    buyMode?: string;
    buyMarkupPercent?: number | null;
    sellMarkupPercent?: number | null;
    buyFlatFeeNgn?: number | null;
    sellFlatFeeNgn?: number | null;
    collectionsTarget?: string | null;
  } | null;
  masterBalances?: unknown[];
};

const base = API_ENDPOINT.ADMIN.obiex;

export async function getObiexStatus(token: string): Promise<ObiexStatus> {
  const res = await apiCall(base + '/status', 'GET', undefined, token);
  return unwrap(res);
}

export async function saveObiexSettings(
  token: string,
  payload: {
    isActive?: boolean;
    buyMode?: string;
    buyMarkupPercent?: number;
    sellMarkupPercent?: number;
    buyFlatFeeNgn?: number;
    sellFlatFeeNgn?: number;
    collectionsTarget?: string;
  }
) {
  const res = await apiCall(base + '/settings', 'PUT', payload, token);
  return unwrap(res);
}

export async function listObiexMarkupRanges(
  token: string,
  side?: 'buy' | 'sell'
): Promise<ObiexMarkupRange[]> {
  const qs = side ? `?side=${side}` : '';
  const res = await apiCall(base + '/markup-ranges' + qs, 'GET', undefined, token);
  return unwrap(res) || [];
}

export async function createObiexMarkupRange(
  token: string,
  payload: {
    side: 'buy' | 'sell';
    minUsd: number;
    maxUsd: number;
    percent: number;
    isActive?: boolean;
    sortOrder?: number;
  }
) {
  const res = await apiCall(base + '/markup-ranges', 'POST', payload, token);
  return unwrap(res);
}

export async function updateObiexMarkupRange(
  token: string,
  id: number,
  payload: {
    side: 'buy' | 'sell';
    minUsd: number;
    maxUsd: number;
    percent: number;
    isActive?: boolean;
    sortOrder?: number;
  }
) {
  const res = await apiCall(base + '/markup-ranges/' + id, 'PUT', payload, token);
  return unwrap(res);
}

export async function deleteObiexMarkupRange(token: string, id: number) {
  const res = await apiCall(base + '/markup-ranges/' + id, 'DELETE', undefined, token);
  return unwrap(res);
}
