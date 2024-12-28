import { API_ENDPOINT } from '../config'
import { apiCall } from '../customApiCall'
import { ApiResponse } from './datainterfaces'

export const createChatGroup = async ({
  data,
  token
}: {
  data: IChatGroupReq
  token: string
}): Promise<ApiResponse> => {
  return await apiCall(API_ENDPOINT.OPERATIONS.CreateChatGroup, 'POST', data, token)
}

interface IChatGroupReq {
  participants: { id: number }[]
  groupName: string
}
