import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('invyte_admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string[]>
}

export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object') {
    if ('items' in data && Array.isArray((data as { items: T[] }).items)) {
      return (data as { items: T[] }).items
    }
    if ('data' in data && Array.isArray((data as { data: T[] }).data)) {
      return (data as { data: T[] }).data
    }
  }
  return []
}
