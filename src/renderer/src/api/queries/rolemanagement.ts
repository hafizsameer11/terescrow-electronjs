import { API_ENDPOINT } from '../config'
import { apiCall } from '../customApiCall'
import { ApiResponse, CreatePermissionsRequest, RolesResponse } from './datainterfaces'

export const createRol = async (token: string, data: any): Promise<ApiResponse> =>
  await apiCall(`${API_ENDPOINT.OPERATIONS.CreateRole}`, 'POST', data, token)

export const getRoles = async (token: string): Promise<RolesResponse> =>
  await apiCall(`${API_ENDPOINT.OPERATIONS.GetRoles}`, 'GET', undefined, token)

export const createPermission = async (
  token: string,
  data: CreatePermissionsRequest
): Promise<ApiResponse> =>
  await apiCall(`${API_ENDPOINT.OPERATIONS.CreatePermissions}`, 'POST', data, token)
