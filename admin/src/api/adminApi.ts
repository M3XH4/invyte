import { apiClient, unwrapList } from '@/lib/axios'
import type {
  ActivityLog,
  AppSettings,
  DashboardStats,
  Event,
  Guest,
  User,
} from '@/types/entities'

type DashboardPayload = {
  stats: DashboardStats
  eventGrowth: { month: string; events: number }[]
  rsvpStatusChart: { name: string; value: number; fill: string }[]
  activityLogs: ActivityLog[]
  upcomingEvents: Event[]
}

type ReportsPayload = {
  eventStatistics: { label: string; value: string | number }[]
  userActivity: { label: string; value: string | number }[]
  rsvpPerformance: { label: string; value: string | number }[]
}

type AnalyticsPayload = {
  going: number
  maybe: number
  notGoing: number
  pending: number
  attendanceRate: number
  responseRate: number
  responseRateOverTime: { week: string; rate: number }[]
  categoryActivity: { category: string; count: number }[]
}

function queryString(params: Record<string, string | undefined>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== 'all') search.set(key, value)
  })
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const adminApi = {
  getDashboard: async () => {
    const { data } = await apiClient.get<{ data: DashboardPayload }>('/admin/dashboard')
    return data.data
  },

  getEvents: async (params: { search?: string; status?: string } = {}) => {
    const { data } = await apiClient.get<{ data: unknown }>(
      `/admin/events${queryString({ search: params.search, status: params.status, per_page: '100' })}`,
    )
    return unwrapList<Event>(data.data)
  },

  getArchivedEvents: async (params: { search?: string } = {}) => {
    const { data } = await apiClient.get<{ data: unknown }>(
      `/admin/events/archived/list${queryString({ search: params.search, per_page: '100' })}`,
    )
    return unwrapList<Event>(data.data)
  },

  getEvent: async (id: string) => {
    const { data } = await apiClient.get<{ data: Event }>(`/admin/events/${id}`)
    return data.data
  },

  archiveEvent: (id: string) => apiClient.post(`/admin/events/${id}/archive`),

  restoreEvent: (id: string) => apiClient.post(`/admin/events/${id}/restore`),

  deleteEvent: (id: string) => apiClient.delete(`/admin/events/${id}`),

  getUsers: async (params: { search?: string; role?: string } = {}) => {
    const { data } = await apiClient.get<{ data: unknown }>(
      `/admin/users${queryString({ search: params.search, role: params.role, per_page: '100' })}`,
    )
    return unwrapList<User>(data.data)
  },

  getGuests: async (params: { search?: string; rsvp_status?: string } = {}) => {
    const { data } = await apiClient.get<{ data: unknown }>(
      `/admin/guests${queryString({
        search: params.search,
        rsvp_status: params.rsvp_status,
        per_page: '100',
      })}`,
    )
    return unwrapList<Guest>(data.data)
  },

  getRsvpAnalytics: async () => {
    const { data } = await apiClient.get<{ data: AnalyticsPayload }>('/admin/analytics/rsvp')
    return data.data
  },

  getReports: async () => {
    const { data } = await apiClient.get<{ data: ReportsPayload }>('/admin/reports')
    return data.data
  },

  getSettings: async () => {
    const { data } = await apiClient.get<{ data: AppSettings }>('/admin/settings')
    return data.data
  },

  updateSettings: async (settings: AppSettings) => {
    const { data } = await apiClient.put<{ data: AppSettings }>('/admin/settings', settings)
    return data.data
  },
}
