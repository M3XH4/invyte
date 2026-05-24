import { apiClient, unwrapList, type ApiResponse } from '@/lib/axios'
import type { Notification } from '@/types/entities'

type NotificationsPayload = {
  items: Notification[]
  unread_count: number
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

function mapNotification(raw: Notification & Record<string, unknown>): Notification {
  return {
    id: String(raw.id),
    title: raw.title,
    message: (raw.message as string) ?? '',
    type: raw.type as Notification['type'],
    recipient: (raw.recipient as string) ?? '',
    isRead: Boolean(raw.isRead ?? raw.is_read),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
    data: (raw.data as Record<string, unknown>) ?? {},
  }
}

export const notificationsApi = {
  list: async (params: { search?: string; read?: string; type?: string } = {}) => {
    const { data } = await apiClient.get<ApiResponse<NotificationsPayload>>('/admin/notifications', {
      params: {
        search: params.search,
        read: params.read,
        type: params.type,
        per_page: 100,
      },
    })
    const payload = data.data
    return {
      items: unwrapList<Notification>(payload.items ?? payload).map((n) =>
        mapNotification(n as Notification & Record<string, unknown>),
      ),
      unreadCount: payload.unread_count ?? 0,
    }
  },

  unreadCount: async () => {
    const { data } = await apiClient.get<ApiResponse<{ unread_count: number }>>(
      '/admin/notifications/unread-count',
    )
    return data.data.unread_count
  },

  markRead: async (id: string) => {
    const { data } = await apiClient.patch<ApiResponse<Notification>>(
      `/admin/notifications/${id}/read`,
    )
    return mapNotification(data.data as Notification & Record<string, unknown>)
  },

  markAllRead: async () => {
    const { data } = await apiClient.post<ApiResponse<{ updated: number; unread_count: number }>>(
      '/admin/notifications/read-all',
    )
    return data.data
  },
}
