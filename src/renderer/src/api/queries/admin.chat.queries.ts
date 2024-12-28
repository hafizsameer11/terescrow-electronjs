import { API_ENDPOINT } from '../config'
import { apiCall } from '../customApiCall'
import {
  AgentToAgentChatResponse,
  AgentToCustomerChatResponse,
  ChatStats,
  CustomerToAgentChatDetailResponse,
  TeamChatDetailsResponse
} from './datainterfaces'

export const getAllAgentToCusomterChats = async ({
  token
}: {
  token: string
}): Promise<AgentToCustomerChatResponse> => {
  return await apiCall(
    `${API_ENDPOINT.OPERATIONS.GetAllAgentToCusomterChats}`,
    'GET',
    undefined,
    token
  )
}

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

export const getChatStats = async ({ token }: { token: string }): Promise<ChatStats> => {
  return await apiCall(`${API_ENDPOINT.OPERATIONS.GetChatStats}`, 'GET', undefined, token)
}
