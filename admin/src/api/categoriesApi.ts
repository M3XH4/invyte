import { apiClient, unwrapList, type ApiResponse } from '@/lib/axios'
import type { EventCategory } from '@/types/entities'

function mapCategory(raw: EventCategory & Record<string, unknown>): EventCategory {
  return {
    id: String(raw.id),
    name: raw.name,
    slug: raw.slug,
    image: (raw.image as string) ?? undefined,
    icon: (raw.icon as string) ?? undefined,
    color: (raw.color as string) ?? '#a855f7',
    description: (raw.description as string) ?? undefined,
    isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
    eventCount: Number(raw.eventCount ?? raw.events_count ?? 0),
  }
}

export type CategoryPayload = {
  name: string
  slug?: string
  icon?: string
  image?: string
  color?: string
  description?: string
  isActive?: boolean
}

export const categoriesApi = {
  list: async (params: { search?: string; active?: string } = {}) => {
    const { data } = await apiClient.get<ApiResponse<unknown>>('/admin/categories', { params })
    return unwrapList<EventCategory>(data.data).map((c) =>
      mapCategory(c as EventCategory & Record<string, unknown>),
    )
  },

  create: async (payload: CategoryPayload) => {
    const { data } = await apiClient.post<ApiResponse<EventCategory>>('/admin/categories', {
      ...payload,
      slug: payload.slug || payload.name.toLowerCase().replace(/\s+/g, '-'),
      is_active: payload.isActive,
    })
    return mapCategory(data.data as EventCategory & Record<string, unknown>)
  },

  update: async (id: string, payload: Partial<CategoryPayload>) => {
    const { data } = await apiClient.put<ApiResponse<EventCategory>>(`/admin/categories/${id}`, {
      ...payload,
      is_active: payload.isActive,
    })
    return mapCategory(data.data as EventCategory & Record<string, unknown>)
  },

  delete: async (id: string) => {
    await apiClient.delete(`/admin/categories/${id}`)
  },
}
