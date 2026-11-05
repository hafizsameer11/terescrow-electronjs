import { apiCall } from '@renderer/api/customApiCall'
import { API_ENDPOINT } from '@renderer/api/config'
import { UserRoles } from '@renderer/context/authContext'

export const loginUser = async (data: {
  email: string
  password: string
}): Promise<ILoginResponse> => {
  return await apiCall(API_ENDPOINT.COMMON.login, 'POST', data)
}

interface ILoginResponse {
  message: string
  data: {
    id: number
    username: string
    firstname: string
    lastname: string
    profilePicture: string | null
    email: string
    role: UserRoles
    /** Session-bound HMAC key (once). Kept in Electron main — strip before React state. */
    requestSigningKey?: string
    requestSigningKid?: string
    requestSigningExpiresAt?: string
  }
  token: string
}
