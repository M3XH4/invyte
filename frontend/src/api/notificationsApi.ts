import { api } from './axios';
import type { PaginatedResponse } from '@/types/api';
import type { Notification } from '@/types/notification';

export type PushTokenPayload = {
  token: string;
  platform?: 'ios' | 'android' | 'web';
  device_name?: string | null;
};

export const notificationsApi = {
  list(page = 1) {
    return api.get<PaginatedResponse<Notification>>('/notifications', {
      params: { page },
    });
  },

  markAsRead(ids?: string[]) {
    return api.post<{ updated: number }>('/notifications/read', ids ? { ids } : {});
  },

  registerPushToken(payload: PushTokenPayload) {
    return api.post<null>('/notifications/push-token', payload);
  },

  unregisterPushToken(payload: PushTokenPayload) {
    return api.delete<null>('/notifications/push-token', { data: payload });
  },
};
