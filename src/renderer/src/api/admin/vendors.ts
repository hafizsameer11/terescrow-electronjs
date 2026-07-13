import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

export interface VendorPayload {
  name: string;
  network: string;
  currency: string;
  walletAddress: string;
  notes?: string;
  walletCurrencyId?: number;
}

export interface VendorRow {
  id: number;
  name: string;
  network: string;
  currency: string;
  walletCurrencyId?: number | null;
  walletCurrency?: { currency?: string; blockchain?: string } | null;
  walletAddress: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAdminVendors(token: string, currency?: string): Promise<VendorRow[]> {
  const url = currency ? `${API_ENDPOINT.ADMIN.vendors}?currency=${encodeURIComponent(currency)}` : API_ENDPOINT.ADMIN.vendors;
  const res = await apiCall(url, 'GET', undefined, token);
  const data = (res as any)?.data;
  return Array.isArray(data) ? data : data?.rows ?? [];
}

export async function createAdminVendor(token: string, payload: VendorPayload): Promise<VendorRow> {
  const res = await apiCall(API_ENDPOINT.ADMIN.vendors, 'POST', payload, token);
  return (res as any)?.data;
}

export async function updateAdminVendor(token: string, id: number, payload: Partial<VendorPayload>): Promise<VendorRow> {
  const res = await apiCall(`${API_ENDPOINT.ADMIN.vendors}/${id}`, 'PATCH', payload, token);
  return (res as any)?.data;
}

export async function deleteAdminVendor(token: string, id: number): Promise<void> {
  await apiCall(`${API_ENDPOINT.ADMIN.vendors}/${id}`, 'DELETE', undefined, token);
}
