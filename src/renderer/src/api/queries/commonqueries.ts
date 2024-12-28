import { API_DOMAIN, API_ENDPOINT } from '../config'
import { apiCall } from '../customApiCall'
import { ApiResponse, ISendMessageToTeamResponse, ITeamChatDetailsResponse, ITeamChatResponse } from './datainterfaces'

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
export const readAllMessages = async ({
  chatId,
  token,
}: {
  chatId: string;
  token: string;
}): Promise<ApiResponse> => {
  return await apiCall(
    API_ENDPOINT.COMMON.MarkAllAsRead,
    'POST',
    { chatId },
    token
  );
};


export const sendMessageToTeam = async (
  data:FormData,
  token: string
): Promise<ISendMessageToTeamResponse> => {
  console.log(data, token);
  return await apiCall(
    API_ENDPOINT.COMMON.SendMessageToTeam,
    'POST',
    data,
    token
  );
};
