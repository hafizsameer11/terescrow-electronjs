import { API_ENDPOINT } from '../config'
import { apiCall } from '../customApiCall'
import { ApiResponse } from './datainterfaces'

export const getAllDefaultChats = async (token: string): Promise<IDefaultChats> => {
  return await apiCall(API_ENDPOINT.AGENT.GetPendingChats, 'GET', undefined, token)
}

export const getAllQuickReplies = async (token: string): Promise<QuickReplyResponse> => {
  return await apiCall(API_ENDPOINT.AGENT.GetQuickReplies, 'GET', undefined, token)
}
export const deleteQuickReply = async (id: number, token: string): Promise<ApiResponse> => {
  return await apiCall(`${API_ENDPOINT.AGENT.DeleteQuickReply}/${id}`, 'GET', undefined, token)
}
export interface IResMessage {
  id: number
  createdAt: Date
  updatedAt: Date
  chatId: number
  message: string
  senderId: number
  receiverId: number
  isRead: boolean
  image?: string
}
export interface IUser {
  id: number
  username: string
  firstname: string
  lastname: string
  profilePicture: string | null
}

export interface DefaultChatsData {
  id: number
  customer: IUser
  recentMessage: IResMessage
  recentMessageTimestamp: Date
  chatStatus: ChatStatus
  messagesCount: number
  department: IDepartment
}
export interface IDefaultChats extends ApiResponse {
  data: DefaultChatsData[]
}

export interface IDepartment {
  id: number
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'inactive'
  title: string
  description: string
  icon: string
}

export enum ChatStatus {
  pending = 'pending',
  successful = 'successful',
  declined = 'declined'
}
export enum ChatType {
  customer_to_agent = 'customer_to_agent',
  team_chat = 'team_chat',
  group_chat = 'group_chat'
}
export interface QuickReply {
  id: number
  message: string
  userId: number
  createdAt: string
}
export interface QuickReplyResponse extends ApiResponse {
  data: QuickReply[]
}
