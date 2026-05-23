import { useCallback, useEffect, useState } from 'react';

import { notificationStore, useNotificationStore } from '@/store/notificationStore';
import type { Notification } from '@/types/notification';

export function useNotifications() {
  const store = useNotificationStore();
  const [notifications, setNotifications] = useState<Notification[]>(store.notifications);
  const [loading, setLoading] = useState(!store.isInitialLoaded);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNotifications(store.notifications);
    if (store.isInitialLoaded) setLoading(false);
  }, [store.isInitialLoaded, store.notifications]);

  const load = useCallback(
    async (refresh = false) => {
      if (refresh) setRefreshing(true);
      else if (!store.isInitialLoaded) setLoading(true);

      try {
        setError(null);
        const response = await notificationStore.fetchNotifications({ refresh });
        setNotifications(Array.isArray(response?.data) ? response.data : []);
      } catch (error: any) {
        setError(error.message || 'Unable to load notifications.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [store.isInitialLoaded],
  );

  useEffect(() => {
    if (store.isInitialLoaded) {
      notificationStore.syncIfStale().catch(() => undefined);
      return;
    }

    load();
  }, [load, store.isInitialLoaded]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationStore.markAllAsRead();
    } catch {
      load();
    }
  }, [load]);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  return {
    notifications: safeNotifications,
    loading,
    refreshing: refreshing || store.isRefreshing,
    error: error || store.error,
    unreadCount: store.unreadCount,
    reload: load,
    refresh: () => load(true),
    markAllAsRead,
  };
}
