import { apiClient, type ApiResponse } from '@/lib/axios'

export { apiClient, unwrapList, type ApiResponse } from '@/lib/axios'
export class ApiError extends Error {
  status?: number
  errors?: Record<string, string[]>

  constructor(message: string, status?: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('invyte_admin_token', token)
  } else {
    localStorage.removeItem('invyte_admin_token')
  }
}

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  try {
    const { data } = await apiClient.get<ApiResponse<T>>(path)
    return data
  } catch (error: unknown) {
    throw normalizeError(error)
  }
}

export async function apiPost<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  try {
    const { data } = await apiClient.post<ApiResponse<T>>(path, body)
    return data
  } catch (error: unknown) {
    throw normalizeError(error)
  }
}

export async function apiPut<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  try {
    const { data } = await apiClient.put<ApiResponse<T>>(path, body)
    return data
  } catch (error: unknown) {
    throw normalizeError(error)
  }
}

function normalizeError(error: unknown): ApiError {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: ApiResponse<unknown>; status?: number } })
      .response
    return new ApiError(
      response?.data?.message ?? 'Request failed',
      response?.status,
      response?.data?.errors,
    )
  }
  return new ApiError(error instanceof Error ? error.message : 'Request failed')
}
