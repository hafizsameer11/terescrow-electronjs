import { toast } from 'react-toastify';
import { ApiError } from '@renderer/api/customApiCall';

export function toastSuccess(message: string) {
  toast.success(message);
}

export function toastError(message: string) {
  toast.error(message);
}

export function toastApiError(err: unknown, fallback = 'Request failed') {
  if (err instanceof ApiError) {
    toast.error(err.message || fallback);
    return;
  }
  if (err instanceof Error) {
    toast.error(err.message || fallback);
    return;
  }
  toast.error(fallback);
}
