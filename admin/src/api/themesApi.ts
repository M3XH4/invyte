import { apiClient, unwrapList, type ApiResponse } from '@/lib/axios'
import type { Theme } from '@/types/entities'

function mapTheme(raw: Theme & Record<string, unknown>): Theme {
  return {
    id: String(raw.id),
    name: raw.name,
    slug: (raw.slug as string) ?? undefined,
    categoryId: (raw.categoryId as string) ?? (raw.category_id as string) ?? undefined,
    category: (raw.category as string) ?? 'General',
    previewColors:
      (raw.previewColors as string[]) ??
      (raw.colors as string[]) ??
      ['#faf5ff', '#9333ea', '#ec4899'],
    primaryColor: (raw.primaryColor as string) ?? (raw.primary_color as string),
    secondaryColor: (raw.secondaryColor as string) ?? (raw.secondary_color as string),
    backgroundColor: (raw.backgroundColor as string) ?? (raw.background_color as string),
    mood: (raw.mood as string) ?? undefined,
    isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
    usageCount: Number(raw.usageCount ?? raw.usage_count ?? 0),
  }
}

export type ThemePayload = {
  name: string
  slug?: string
  categoryId?: string
  colors?: string[]
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  mood?: string
  isActive?: boolean
}

export const themesApi = {
  list: async (params: { search?: string; category_id?: string; active?: string } = {}) => {
    const { data } = await apiClient.get<ApiResponse<unknown>>('/admin/themes', { params })
    return unwrapList<Theme>(data.data).map((t) => mapTheme(t as Theme & Record<string, unknown>))
  },

  create: async (payload: ThemePayload) => {
    const { data } = await apiClient.post<ApiResponse<Theme>>('/admin/themes', {
      name: payload.name,
      slug: payload.slug,
      category_id: payload.categoryId,
      colors: payload.colors,
      primary_color: payload.primaryColor ?? payload.colors?.[1],
      secondary_color: payload.secondaryColor ?? payload.colors?.[2],
      background_color: payload.backgroundColor ?? payload.colors?.[0],
      mood: payload.mood,
      is_active: payload.isActive,
    })
    return mapTheme(data.data as Theme & Record<string, unknown>)
  },

  update: async (id: string, payload: Partial<ThemePayload>) => {
    const { data } = await apiClient.put<ApiResponse<Theme>>(`/admin/themes/${id}`, {
      name: payload.name,
      slug: payload.slug,
      category_id: payload.categoryId,
      colors: payload.colors,
      primary_color: payload.primaryColor,
      secondary_color: payload.secondaryColor,
      background_color: payload.backgroundColor,
      mood: payload.mood,
      is_active: payload.isActive,
    })
    return mapTheme(data.data as Theme & Record<string, unknown>)
  },

  delete: async (id: string) => {
    await apiClient.delete(`/admin/themes/${id}`)
  },
}
