import { API_ENDPOINT } from "../config";
import { apiCall } from "../customApiCall";
import { ApiResponse } from "./datainterfaces";

export const sendMessageToCustomer = async (
  data: FormData,
  token: string
): Promise<IMesssageToCustomer> => {
  console.log(data);
  return await apiCall(
    API_ENDPOINT.OPERATIONS.SendMessageToCustomer,
    'POST',
    data,
    token
  );
};
export const createCryptoTransaction = async ({
  data,
  token,
}: {
  data: ICryptoTransactionReq;
  token: string;
}): Promise<ApiResponse> => {
  return await apiCall(
    API_ENDPOINT.AGENT.CreateCryptoTransaction,
    'POST',
    data,
    token
  );
};

export const createCardTransaction = async ({
  data,
  token,
}: {
  data: ICardTransactionReq;
  token: string;
}): Promise<ApiResponse> => {
  return await apiCall(
    API_ENDPOINT.AGENT.CreateCardTransaction,
    'POST',
    data,
    token
  );
};
export const changeChatStatus = async (
  data: { chatId: string; setStatus: ChatStatus },
  token: string
): Promise<ApiResponse> => {
  return apiCall(API_ENDPOINT.AGENT.ChangeChatStatus, 'POST', data, token);
};

export const overTakeChat = async (
  chatId: string,
  token: string
): Promise<ApiResponse> => (
  await apiCall(
    `${API_ENDPOINT.AGENT.TakeOverDefaultChat}/${chatId}`,
    'POST',
    undefined,
    token
  )
)
export enum ChatStatus {
  pending = 'pending',
  successful = 'successful',
  declined = 'declined',
}

interface ITransactionReq {
  subCategoryId: number;
  countryId: number;
  chatId: number;
  amount: number;
  exchangeRate: number;
  amountNaira: number;
}
interface ICryptoTransactionReq extends ITransactionReq {
  cryptoAmount: number;
  departmentId?: number;
  categoryId?: number;
  toAddress: string;
  fromAddress: string;
}

interface ICardTransactionReq extends ITransactionReq {
  cardType: string;
  cardNumber: string;
  departmentId?: number;
  categoryId?: number;
}
interface IMesssageToCustomer extends ApiResponse {
  data: IResMessage;
}

export interface IResMessage {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  chatId: number;
  message: string;
  senderId: number;
  receiverId: number;
  isRead: boolean;
  image?: string;
}
