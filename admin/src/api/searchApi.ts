import { apiClient, type ApiResponse } from '@/lib/axios'
import type { Event, EventCategory, Guest, Theme, User } from '@/types/entities'

export type SearchResults = {
  events: Event[]
  users: User[]
  guests: Guest[]
  categories: EventCategory[]
  themes: Theme[]
}

export const searchApi = {
  search: async (q: string): Promise<SearchResults> => {
    const { data } = await apiClient.get<ApiResponse<SearchResults>>('/admin/search', {
      params: { q },
    })
    return data.data
  },
}
