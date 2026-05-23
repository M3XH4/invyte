import { api } from './axios';
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
    return api.post<User>('/profile/avatar', payload);
  },

  stats() {
    return api.get<ProfileStats>('/profile/stats');
  },
};
