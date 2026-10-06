import { Id, toast } from 'react-toastify';
import { ApiError } from '@renderer/api/customApiCall';

export function toastSuccess(message: string) {
  toast.success(message);
}

export function toastError(message: string) {
  toast.error(message);
}

export function toastLoading(message: string): Id {
  return toast.loading(message);
}

export function toastUpdateSuccess(id: Id, message: string) {
  toast.update(id, {
    render: message,
    type: 'success',
    isLoading: false,
    autoClose: 6000,
  });
}

export function toastUpdateError(id: Id, message: string) {
  toast.update(id, {
    render: message,
    type: 'error',
    isLoading: false,
    autoClose: 6000,
  });
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
