import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';
import { mapFreezeFeatureToApi } from '@renderer/utils/freezeFeatures';

export type CustomerFreezeResult = {
  frozenFeatures?: string[];
  message?: string;
};

export async function freezeCustomerFeature(
  token: string,
  customerId: string | number,
  body: { feature: string }
): Promise<CustomerFreezeResult> {
  const res = await apiCall(
    API_ENDPOINT.ADMIN.customerFreeze(customerId),
    'POST',
    { feature: mapFreezeFeatureToApi(body.feature) },
    token
  );
  return { ...((res as any)?.data ?? {}), message: (res as any)?.message };
}

export async function unfreezeCustomerFeature(
  token: string,
  customerId: string | number,
  body: { feature: string }
): Promise<CustomerFreezeResult> {
  const res = await apiCall(
    API_ENDPOINT.ADMIN.customerUnfreeze(customerId),
    'POST',
    { feature: mapFreezeFeatureToApi(body.feature) },
    token
  );
  return { ...((res as any)?.data ?? {}), message: (res as any)?.message };
}

export async function banCustomer(
  token: string,
  customerId: string | number,
  body?: { reason?: string; permanent?: boolean }
): Promise<{ status?: string }> {
  const res = await apiCall(API_ENDPOINT.ADMIN.customerBan(customerId), 'POST', body ?? {}, token);
  return (res as any)?.data ?? {};
}
