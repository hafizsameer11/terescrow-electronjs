import { API_ENDPOINT } from '../config'
import { apiCall } from '../customApiCall'
import {
  AgentToAgentChatResponse,
  AgentToCustomerChatResponse,
  ChatStats,
  CustomerToAgentChatDetailResponse,
  TeamChatDetailsResponse
} from './datainterfaces'
import {
  AdminDashboardStatsResponse,
  AdminTransactionStatsResponse,
  CustomerStatsResponse,
  TeamStatsResponse
} from './statDataInterface'

// export const getAllAgentToCusomterChats = async ({
//   token,
//   page = 1,
//   limit = 50,
//   filters = {},
// }: {
//   token: string;
//   page?: number;
//   limit?: number;
//   filters?: {
//     status?: string;
//     type?: string;
//     category?: string;
//     q?: string;
//     start?: string; // YYYY-MM-DD
//     end?: string;   // YYYY-MM-DD
//   };
// }) => {
//   const params = new URLSearchParams({ page: String(page), limit: String(limit) });
//   Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
//   return apiCall(`${API_ENDPOINT.OPERATIONS.GetAllAgentToCusomterChats}?${params}`, 'GET', undefined, token);
// };


export type ChatRow = {
  id: string;
  updatedAt?: string;
  createdAt?: string | null;
  chatStatus?: string | null;
  department?: { id: string; title: string; Type?: string; niche?: string } | null;
  category?: { id: string; title: string } | null;
  customer?: {
    id: string;
    username?: string;
    firstname?: string;
    lastname?: string;
    role?: string;
    profilePicture?: string | null;
    country?: string | null;
  } | null;
  agent?: {
    id: string;
    username?: string;
    firstname?: string;
    lastname?: string;
    role?: string;
    profilePicture?: string | null;
    country?: string | null;
  } | null;
  recentMessage?: { id: string; message?: string; createdAt?: string } | null;
  unreadCount?: number;
  transactionsCount?: number; // backend should return count (not full array)
};

export type PaginatedChatsResponse = {
  success: boolean;
  message: string;
  data: ChatRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const getChatStats = async ({ token }: { token: string }) => {
  return apiCall(`${API_ENDPOINT.OPERATIONS.GetChatStats}`, 'GET', undefined, token);
};

type Filters = {
  status?: string;
  type?: string;
  category?: string;
  q?: string;
  start?: string; // YYYY-MM-DD
  end?: string;   // YYYY-MM-DD
};

export const getAllAgentToCusomterChats = async ({
  token,
  page = 1,
  limit = 50,
  filters = {},
}: {
  token: string;
  page?: number;
  limit?: number;
  filters?: Filters;
}): Promise<PaginatedChatsResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      params.set(k, String(v));
    }
  });

  return apiCall(
    `${API_ENDPOINT.OPERATIONS.GetAllAgentToCusomterChats}?${params.toString()}`,
    'GET',
    undefined,
    token
  );
};
export const getSingleAgentToCusomterChat = async ({
  token,
  agentId
}: {
  token: string
  agentId: string
}): Promise<AgentToCustomerChatResponse> => {
  return await apiCall(
    `${API_ENDPOINT.OPERATIONS.GetSingleAgentToCusomterChat}/${agentId}`,
    'GET',
    undefined,
    token
  )
}

export const getSingleAgentToTeamChats = async ({
  token,
  agentId
}: {
  token: string
  agentId: string
}): Promise<AgentToAgentChatResponse> => {
  return await apiCall(
    `${API_ENDPOINT.OPERATIONS.GetAgentToTeamChats}/${agentId}`,
    'GET',
    undefined,
    token
  )
}
//ChatDetails
export const getAgentToCustomerChatDetails = async ({
  token,
  chatId
}: {
  token: string
  chatId: string
}): Promise<CustomerToAgentChatDetailResponse> => {
  return await apiCall(
    `${API_ENDPOINT.OPERATIONS.GetAgentCustomerChatDetails}/${chatId}`,
    'GET',
    undefined,
    token
  )
}
export const getAgentToAgentChatDetails = async ({
  token,
  chatId
}: {
  token: string
  chatId: string
}): Promise<TeamChatDetailsResponse> => {
  return await apiCall(
    `${API_ENDPOINT.OPERATIONS.GetAgentTeamChatDetails}/${chatId}`,
    'GET',
    undefined,
    token
  )
}

// export const getChatStats = async ({ token }: { token: string }): Promise<ChatStats> => {
//   return await apiCall(`${API_ENDPOINT.OPERATIONS.GetChatStats}`, 'GET', undefined, token)
// }

export const getCustomerStats = async ({
  token
}: {
  token: string
}): Promise<CustomerStatsResponse> => {
  return await apiCall(`${API_ENDPOINT.OPERATIONS.GetCustomerStats}`, 'GET', undefined, token)
}
export const getDashBoardStats = async ({
  token
}: {
  token: string
}): Promise<AdminDashboardStatsResponse> => {
  return await apiCall(`${API_ENDPOINT.OPERATIONS.GetDashboardStats}`, 'GET', undefined, token)
}
export const getTeamStats = async ({ token }: { token: string }): Promise<TeamStatsResponse> => {
  return await apiCall(`${API_ENDPOINT.OPERATIONS.GetTeamStats}`, 'GET', undefined, token)
}
export const getTransactionStats = async ({
  token
}: {
  token: string
}): Promise<AdminTransactionStatsResponse> => {
  return await apiCall(`${API_ENDPOINT.OPERATIONS.GetTransactionStats}`, 'GET', undefined, token)
}
