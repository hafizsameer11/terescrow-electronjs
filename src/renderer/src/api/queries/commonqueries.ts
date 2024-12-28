import { API_DOMAIN, API_ENDPOINT } from '../config'
import { apiCall } from '../customApiCall'
import { ITeamChatDetailsResponse, ITeamChatResponse } from './datainterfaces'

export const getAllTeamChats = async (token: string): Promise<ITeamChatResponse> => {
  // console.log('messages fetching...');
  return await apiCall(API_ENDPOINT.OPERATIONS.GetAllTeamChats, 'GET', undefined, token)
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
  );
};
