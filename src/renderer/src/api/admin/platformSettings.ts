import { apiCall } from '../customApiCall';
import { API_ENDPOINT } from '../config';

export interface PlatformOperationSettings {
  palmpayWithdrawDisabled: boolean;
  cryptoOutsideSendDisabled: boolean;
}

export async function getPlatformOperationSettings(token: string): Promise<PlatformOperationSettings> {
  const res = await apiCall(API_ENDPOINT.ADMIN.platformOperationSettings, 'GET', undefined, token);
  const data = (res as { data?: PlatformOperationSettings })?.data;
  return {
    palmpayWithdrawDisabled: data?.palmpayWithdrawDisabled ?? false,
    cryptoOutsideSendDisabled: data?.cryptoOutsideSendDisabled ?? false,
  };
}

export async function updatePlatformOperationSettings(
  token: string,
  body: Partial<PlatformOperationSettings>
): Promise<PlatformOperationSettings> {
  const res = await apiCall(API_ENDPOINT.ADMIN.platformOperationSettings, 'PUT', body, token);
  const data = (res as { data?: PlatformOperationSettings })?.data;
  return {
    palmpayWithdrawDisabled: data?.palmpayWithdrawDisabled ?? false,
    cryptoOutsideSendDisabled: data?.cryptoOutsideSendDisabled ?? false,
  };
}
