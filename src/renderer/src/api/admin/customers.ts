import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

export async function freezeCustomerFeature(
  token: string,
  customerId: string | number,
  body: { feature: string }
): Promise<{ frozenFeatures?: string[] }> {
  const res = await apiCall(API_ENDPOINT.ADMIN.customerFreeze(customerId), 'POST', body, token);
  return (res as any)?.data ?? {};
}

export async function unfreezeCustomerFeature(
  token: string,
  customerId: string | number,
  body: { feature: string }
): Promise<{ frozenFeatures?: string[] }> {
  const res = await apiCall(API_ENDPOINT.ADMIN.customerUnfreeze(customerId), 'POST', body, token);
  return (res as any)?.data ?? {};
}

export async function banCustomer(
  token: string,
  customerId: string | number,
  body?: { reason?: string; permanent?: boolean }
): Promise<{ status?: string }> {
  const res = await apiCall(API_ENDPOINT.ADMIN.customerBan(customerId), 'POST', body ?? {}, token);
  return (res as any)?.data ?? {};
}
