import { api } from './axios';
import type { ActivityLog } from '@/types/event';

function normalizeActivityLogsResponse(response: unknown): ActivityLog[] {
  if (Array.isArray(response)) return response as ActivityLog[];
  const payload = response as any;
  if (Array.isArray(payload?.data)) return payload.data as ActivityLog[];
  if (Array.isArray(payload?.data?.data)) return payload.data.data as ActivityLog[];
  if (Array.isArray(payload?.logs)) return payload.logs as ActivityLog[];
  return [];
}

export const activityLogsApi = {
  async getEventActivityLogs(eventId: string) {
    const response = await api.get<unknown>(`/events/${eventId}/activity-logs`);
    return normalizeActivityLogsResponse(response);
  },
};
