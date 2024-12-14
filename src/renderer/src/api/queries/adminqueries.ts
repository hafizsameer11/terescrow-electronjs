// import { number, string } from 'yup'
import { API_ENDPOINT } from '../config'
import { apiCall } from '../customApiCall'
import {
  AgentByDepartmentResponse,
  AllCustomerRespone,
  CategroiesResponse,
  CustomerTransactionResponse,
  DepartmentResponse,
  RateResponse,
  TeamResponse
} from './datainterfaces'
// import * from './index'
export const gettAllCustomerss = async ({
  token
}: {
  token: string
}): Promise<AllCustomerRespone> => {
  return await apiCall(API_ENDPOINT.CUSTOMER.AllCustomers, 'GET', undefined, token)
}
export const getCustomerDetails = async ({
  token,
  id
}: {
  token: string
  id: string
}): Promise<AllCustomerRespone> => {
  return await apiCall(`${API_ENDPOINT.CUSTOMER.CustomerDetails}/${id}`, 'GET', undefined, token)
}
export const getCustomerTransactions = async ({
  token,
  id
}: {
  token: string
  id: string
}): Promise<CustomerTransactionResponse> => {
  return await apiCall(
    `${API_ENDPOINT.CUSTOMER.CustomerTransactions}/${id}`,
    'GET',
    undefined,
    token
  )
}
export const getTransactions = async ({
  token
}: {
  token: string
}): Promise<CustomerTransactionResponse> => {
  return await apiCall(`${API_ENDPOINT.OPERATIONS.Traansactions}`, 'GET', undefined, token)
}

export const getDepartments = async ({ token }: { token: string }): Promise<DepartmentResponse> => {
  return await apiCall(`${API_ENDPOINT.OPERATIONS.Departments}`, 'GET', undefined, token)
}
export const getAgentByDepartment = async ({
  token,
  id
}: {
  token: string
  id: string
}): Promise<AgentByDepartmentResponse> => {
  return await apiCall(
    `${API_ENDPOINT.OPERATIONS.AgentByDepartment}/${id}`,
    'GET',
    undefined,
    token
  )
}
export const getRate = async ({ token }: { token: string }): Promise<RateResponse> => {
  return await apiCall(`${API_ENDPOINT.OPERATIONS.GetRate}`, 'GET', undefined, token)
}
export const getTeam = async ({ token }: { token: string }): Promise<TeamResponse> => {
  return await apiCall(`${API_ENDPOINT.OPERATIONS.GetTeam}`, 'GET', undefined, token)
}
export const getCategories = async ({ token }: { token: string }): Promise<CategroiesResponse> => {
  return await apiCall(`${API_ENDPOINT.OPERATIONS.GetCategories}`, 'GET', undefined, token)
}
