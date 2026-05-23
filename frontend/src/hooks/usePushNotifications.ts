import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';

import {
  getPushEnabledPreference,
  isAndroidExpoGo,
  registerDeviceForPushNotifications,
  setPushEnabledPreference,
  unregisterDeviceForPushNotifications,
} from '@/services/pushNotifications';
import { useAuth } from './useAuth';

export function usePushNotifications() {
  const { isAuthenticated, initializing } = useAuth();
  const [enabled, setEnabled] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const enable = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      await setPushEnabledPreference(true);
      const result = await registerDeviceForPushNotifications();
      setEnabled(!!result.token);
      setStatusMessage(result.message);
    } catch (error: any) {
      setEnabled(false);
      setStatusMessage(error.message || 'Unable to enable push notifications.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const disable = useCallback(async () => {
    setLoading(true);
    try {
      await unregisterDeviceForPushNotifications();
      setEnabled(false);
      setStatusMessage('Push notifications disabled on this device.');
    } catch (error: any) {
      setStatusMessage(error.message || 'Unable to disable push notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggle = useCallback(
    async (value: boolean) => {
      if (value) await enable();
      else await disable();
    },
    [disable, enable],
  );

  useEffect(() => {
    getPushEnabledPreference().then(setEnabled);
  }, []);

  useEffect(() => {
    if (initializing || !isAuthenticated) return;

    getPushEnabledPreference().then((allowed) => {
      if (allowed) enable();
    });
  }, [enable, initializing, isAuthenticated]);

  useEffect(() => {
    if (isAndroidExpoGo()) return;

    let subscription: { remove: () => void } | null = null;
    let mounted = true;

    import('expo-notifications')
      .then((Notifications) => {
        if (!mounted) return;

        subscription = Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data;

          if (data?.event_id || data?.slug) {
            router.push('/notifications' as any);
            return;
          }

          router.push('/notifications' as any);
        });
      })
      .catch(() => {
        // Expo Go on Android can lack remote notification support; keep routes loadable.
      });

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  return {
    enabled,
    loading,
    statusMessage,
    toggle,
    enable,
    disable,
  };
}
