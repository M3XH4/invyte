import { useSyncExternalStore } from 'react';

import { notificationsApi } from '@/api/notificationsApi';
import type { Notification } from '@/types/notification';

const NOTIFICATIONS_STALE_MS = 60 * 1000;

type NotificationState = {
  notifications: Notification[];
  unreadCount: number;
  isInitialLoaded: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetchedAt: number | null;
};

let state: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isInitialLoaded: false,
  isRefreshing: false,
  error: null,
  lastFetchedAt: null,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function countUnread(notifications: Notification[]) {
  return notifications.filter((item) => item.unread || !item.is_read).length;
}

function setState(patch: Partial<NotificationState>) {
  state = { ...state, ...patch };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export const notificationStore = {
  subscribe,
  getSnapshot,

  hydrateNotifications(notifications: Notification[]) {
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    setState({
      notifications: safeNotifications,
      unreadCount: countUnread(safeNotifications),
      isInitialLoaded: true,
      lastFetchedAt: Date.now(),
      error: null,
    });
  },

  async fetchNotifications(options: { refresh?: boolean } = {}) {
    if (options.refresh) setState({ isRefreshing: true });

    try {
      setState({ error: null });
      const response = await notificationsApi.list();
      const notifications = Array.isArray(response?.data) ? response.data : [];
      notificationStore.hydrateNotifications(notifications);
      return response;
    } catch (error: any) {
      setState({ error: error.message || 'Unable to load notifications.' });
      throw error;
    } finally {
      setState({ isRefreshing: false });
    }
  },

  async refreshNotifications() {
    return notificationStore.fetchNotifications({ refresh: true });
  },

  async syncIfStale() {
    if (state.lastFetchedAt && Date.now() - state.lastFetchedAt < NOTIFICATIONS_STALE_MS) {
      return null;
    }

    return notificationStore.fetchNotifications({ refresh: true });
  },

  async markAllAsRead() {
    const previous = state.notifications;
    const next = previous.map((item) => ({ ...item, is_read: true, unread: false }));
    notificationStore.hydrateNotifications(next);

    try {
      await notificationsApi.markAsRead();
    } catch (error) {
      notificationStore.hydrateNotifications(previous);
      throw error;
    }
  },

  clear() {
    setState({
      notifications: [],
      unreadCount: 0,
      isInitialLoaded: false,
      isRefreshing: false,
      error: null,
      lastFetchedAt: null,
    });
  },
};

export function useNotificationStore() {
  return useSyncExternalStore(
    notificationStore.subscribe,
    notificationStore.getSnapshot,
    notificationStore.getSnapshot,
  );
}
