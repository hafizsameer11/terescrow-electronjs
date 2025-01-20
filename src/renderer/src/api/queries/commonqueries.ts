import { API_DOMAIN, API_ENDPOINT } from '../config'
import { apiCall } from '../customApiCall'
import {
  ApiResponse,
  ISendMessageToTeamResponse,
  ITeamChatDetailsResponse,
  ITeamChatResponse
} from './datainterfaces'

export const getAllTeamChats = async (token: string): Promise<ITeamChatResponse> => {
  // console.log('messages fetching...');
  return await apiCall(API_ENDPOINT.OPERATIONS.GetAllTeamChats, 'GET', undefined, token)
}
export const markAllMessageread = async (token: string): Promise<ApiResponse> => {
  // console.log('messages fetching...');
  return await apiCall(API_ENDPOINT.COMMON.MarkAllMessageRead, 'GET', undefined, token)
}
export const getTeamChatDetails = async (
  token: string,
  chatId: string
): Promise<ITeamChatDetailsResponse> => {
  return await apiCall(
    API_ENDPOINT.COMMON.GetTeamChatDetails + '/' + chatId,
    'GET',
    undefined,
    token
  )
}
export const readAllMessages = async ({
  chatId,
  token
}: {
  chatId: string
  token: string
}): Promise<ApiResponse> => {
  return await apiCall(API_ENDPOINT.COMMON.MarkAllAsRead, 'POST', { chatId }, token)
}

export const sendMessageToTeam = async (
  data: FormData,
  token: string
): Promise<ISendMessageToTeamResponse> => {
  return await apiCall(API_ENDPOINT.COMMON.SendMessageToTeam, 'POST', data, token)
}

//notifications
export const getTeamNotifications = async (token: string): Promise<IInAppNotificationResponse> => {
  return await apiCall(API_ENDPOINT.OPERATIONS.GetTeamNotifications, 'GET', undefined, token)
}

export const getCustomerNotifications = async (
  token: string
): Promise<IInAppNotificationResponse> => {
  return await apiCall(API_ENDPOINT.OPERATIONS.GetCustomerNotifications, 'GET', undefined, token)
}

export const getSubCategories = async (
  token: string,
  departmentId: string,
  categoryId: string
): Promise<ISubCategoryResponse> => {
  return await apiCall(
    `${API_ENDPOINT.COMMON.GetActionSubacategories}?departmentId=${departmentId}&categoryId=${categoryId}`,
    'GET',
    undefined,
    token
  )
}
export const getunreadMessageCount = async (token: string): Promise<ApiResponse> => {
  return await apiCall(API_ENDPOINT.COMMON.GetUnreadMessageCount, 'GET', undefined, token)
}

export const chnagePassword = async (data: IChangePasswordReq, token: string) => {
  //   console.log(data);
  return await apiCall(API_ENDPOINT.OPERATIONS.ChangePassword, 'POST', data, token)
}
interface IChangePasswordReq {
  oldPassword: string
  newPassword: string
}

export interface ISubCategoryResponse extends ApiResponse {
  data: {
    departmentId: string
    categoryId: string
    subCategories: [
      {
        subCategory: {
          id: number
          title: string
          createdAt: Date
          updatedAt: Date
          price: number
        }
      }
    ]
  }
}
export interface IInAppNotificationResponse extends ApiResponse {
  data: InAppNotifications[]
}
interface TransactionStateResponse {
  status: string
  message: string
  data: {
    transactionAmountTotal: number
    transactionAmountTotalNaira: number
  }
}
export interface InAppNotifications {
  id: number
  title: string
  description: string
  type: string
  createdAt: string
  isRead: boolean
}
