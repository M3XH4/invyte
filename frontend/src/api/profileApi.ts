import { API_BASE_URL, api, apiClient } from './axios';
import type { User } from '@/types/auth';

export type ProfileStats = {
  events_hosted: number;
  guests_invited: number;
  upcoming_events?: number;
  unread_notifications?: number;
  attendance_rate?: string;
};

export const profileApi = {
  me() {
    return api.get<User>('/profile');
  },

  update(payload: Partial<User>) {
    return api.put<User>('/profile', payload);
  },

  updateAvatar(payload: FormData) {
    const finalBaseUrl = String(apiClient.defaults.baseURL || API_BASE_URL).replace(/\/$/, '');

    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.log('[profileApi.uploadAvatar]', {
        configuredBaseURL: API_BASE_URL,
        activeBaseURL: apiClient.defaults.baseURL,
        url: `${finalBaseUrl}/profile/avatar`,
        isFormData: typeof FormData !== 'undefined' && payload instanceof FormData,
      });
    }

    return api.post<User>('/profile/avatar', payload, { timeout: 30000 });
  },

  uploadAvatar(payload: FormData) {
    return profileApi.updateAvatar(payload);
  },

  stats() {
    return api.get<ProfileStats>('/profile/stats');
  },
};
