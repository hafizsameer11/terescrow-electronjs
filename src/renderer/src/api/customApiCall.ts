import axios, { AxiosResponse } from 'axios'
import { isReadOnlyDemoSession } from '@renderer/utils/appleReviewUser'

export class ApiError extends Error {
  data: any
  statusText: string = ''
  statusCode?: number
  constructor(data: any, statusText: string, message: string, statusCode?: number) {
    super()
    this.data = data
    this.message = message
    this.statusText = statusText
    this.statusCode = statusCode
  }
}

function staffHmacApi() {
  return (window as any)?.electron?.staffHmac as
    | {
        sign: (p: {
          method: string
          url: string
          rawBody?: string
        }) => Promise<Record<string, string> | null>
        clear: () => Promise<unknown>
      }
    | undefined
}

/** Serialize JSON body once so HMAC hash matches exact bytes axios sends. */
function prepareBody(
  method: string,
  data: any
): { body: any; rawBody: string; isJsonString: boolean; isFormData: boolean } {
  const m = method.toUpperCase()
  if (m === 'GET' || m === 'HEAD' || data === undefined || data === null) {
    return { body: undefined, rawBody: '', isJsonString: false, isFormData: false }
  }
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    // Multipart: express.json does not capture rawBody — sign empty body.
    return { body: data, rawBody: '', isJsonString: false, isFormData: true }
  }
  if (typeof data === 'string') {
    return { body: data, rawBody: data, isJsonString: true, isFormData: false }
  }
  const rawBody = JSON.stringify(data)
  return { body: rawBody, rawBody, isJsonString: true, isFormData: false }
}

async function staffHmacHeaders(
  method: string,
  url: string,
  rawBody: string
): Promise<Record<string, string>> {
  try {
    const api = staffHmacApi()
    if (!api?.sign) return {}
    const headers = await api.sign({ method, url, rawBody })
    return headers && typeof headers === 'object' ? headers : {}
  } catch {
    return {}
  }
}

export const apiCall = async (url: string, method: string, data?: any, token?: string) => {
  const httpMethod = (method || 'GET').toUpperCase()
  if (isReadOnlyDemoSession() && httpMethod !== 'GET' && httpMethod !== 'HEAD') {
    throw new ApiError(
      undefined,
      'Forbidden',
      'You do not have permission to perform this action.',
      403
    )
  }

  const prepared = prepareBody(httpMethod, data)
  const hmacHeaders = await staffHmacHeaders(httpMethod, url, prepared.rawBody)

  const headers: Record<string, string> = {
    Authorization: token ? `Bearer ${token}` : '',
    ...hmacHeaders,
  }

  if (prepared.isFormData) {
    // Let axios set multipart boundary
  } else if (prepared.isJsonString || prepared.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  } else if (httpMethod !== 'GET' && httpMethod !== 'HEAD' && httpMethod !== 'DELETE') {
    headers['Content-Type'] = 'application/json'
  }

  const axiosConfig = {
    headers,
    // Body already stringified for HMAC — do not re-serialize
    transformRequest: prepared.isJsonString
      ? [(body: any) => body]
      : undefined,
  }

  try {
    let response: AxiosResponse | undefined
    switch (httpMethod) {
      case 'GET':
        response = await axios.get(url, axiosConfig)
        break
      case 'POST':
        response = await axios.post(url, prepared.body, axiosConfig)
        break
      case 'PUT':
        response = await axios.put(url, prepared.body, axiosConfig)
        break
      case 'PATCH':
        response = await axios.patch(url, prepared.body, axiosConfig)
        break
      case 'DELETE':
        response = await axios.delete(url, axiosConfig)
        break
      default:
        throw new Error('Unsupported HTTP method')
    }
    return response?.data
  } catch (error) {
    console.log(error)
    console.clear()
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        try {
          await staffHmacApi()?.clear?.()
        } catch {
          // ignore
        }
      }
      if (error.response) {
        throw new ApiError(
          error.response.data,
          error.response.statusText,
          error.response.data?.message || 'Something went wrong',
          error.response.status
        )
      } else if (error.request) {
        throw new ApiError(
          undefined,
          'No response received',
          'The server did not respond to the request'
        )
      }
    } else {
      throw new ApiError(undefined, 'Network or server error occurred', 'Something wend wrong')
    }
  }
}
