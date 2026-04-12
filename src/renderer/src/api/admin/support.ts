import { API_ENDPOINT } from '../config';
import { apiCall } from '../customApiCall';

/** Map frontend tab to backend filter: All -> no filter, Active -> processing, Unread -> unread, Closed -> completed */
export type SupportChatFilter = 'All' | 'Active' | 'Unread' | 'Closed';

export function toSupportFilter(filter: SupportChatFilter): string | undefined {
  if (filter === 'All') return undefined;
  if (filter === 'Active') return 'processing';
  if (filter === 'Closed') return 'completed';
  if (filter === 'Unread') return 'unread';
  return undefined;
}

export async function getSupportChats(
  token: string,
  params?: { filter?: SupportChatFilter; search?: string; page?: number; limit?: number }
): Promise<{ chats: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const searchParams = new URLSearchParams();
  const backendFilter = params?.filter ? toSupportFilter(params.filter) : undefined;
  if (backendFilter) searchParams.set('filter', backendFilter);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page != null) searchParams.set('page', String(params.page));
  if (params?.limit != null) searchParams.set('limit', String(params.limit));
  const url = searchParams.toString() ? `${API_ENDPOINT.ADMIN.supportChats}?${searchParams}` : API_ENDPOINT.ADMIN.supportChats;
  const res = await apiCall(url, 'GET', undefined, token);
  const data = (res as any)?.data;
  return data ?? { chats: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
}

export async function getSupportChatMessages(
  token: string,
  chatId: string | number,
  params?: { before?: string; limit?: number }
): Promise<any[]> {
  const searchParams = new URLSearchParams();
  if (params?.before) searchParams.set('before', params.before);
  if (params?.limit != null) searchParams.set('limit', String(params.limit));
  const url = searchParams.toString()
    ? `${API_ENDPOINT.ADMIN.supportChatMessages(chatId)}?${searchParams}`
    : API_ENDPOINT.ADMIN.supportChatMessages(chatId);
  const res = await apiCall(url, 'GET', undefined, token);
  const data = (res as any)?.data;
  return data?.messages ?? data ?? [];
}

export async function sendSupportChatMessage(
  token: string,
  chatId: string | number,
  body: { text: string },
  image?: File
): Promise<any> {
  let payload: any = body;
  if (image) {
    const form = new FormData();
    form.append('text', body.text);
    form.append('image', image);
    payload = form;
  }
  const res = await apiCall(API_ENDPOINT.ADMIN.supportChatMessages(chatId), 'POST', payload, token);
  return (res as any)?.data;
}

export async function updateSupportChat(
  token: string,
  chatId: string | number,
  body: { status?: string; markRead?: boolean }
): Promise<any> {
  const res = await apiCall(API_ENDPOINT.ADMIN.supportChatUpdate(chatId), 'PATCH', body, token);
  return (res as any)?.data;
}
