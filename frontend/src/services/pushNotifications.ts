import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { notificationsApi } from '@/api/notificationsApi';
import { getPreference, setPreference } from '@/utils/preferences';

export const PUSH_TOKEN_KEY = 'invyte_expo_push_token';
export const PUSH_ENABLED_KEY = 'invyte_push_enabled';

let handlerConfigured = false;

export function isAndroidExpoGo() {
  const constants = Constants as any;

  return Platform.OS === 'android' && (
    constants.appOwnership === 'expo' ||
    constants.executionEnvironment === 'storeClient' ||
    constants.executionEnvironment === 'StoreClient'
  );
}

async function getNotificationsModule() {
  if (isAndroidExpoGo()) return null;

  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

async function configureNotificationHandler() {
  if (handlerConfigured) return;

  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  handlerConfigured = true;
}

function getProjectId() {
  return (
    Constants.easConfig?.projectId ||
    Constants.expoConfig?.extra?.eas?.projectId ||
    (Constants as any).manifest?.extra?.eas?.projectId
  );
}

export async function getPushEnabledPreference() {
  const stored = await getPreference(PUSH_ENABLED_KEY);
  return stored !== 'false';
}

export async function setPushEnabledPreference(enabled: boolean) {
  await setPreference(PUSH_ENABLED_KEY, enabled ? 'true' : 'false');
}

export async function registerDeviceForPushNotifications() {
  if (Platform.OS === 'web') {
    return { token: null, message: 'Push notifications are only available on iOS and Android.' };
  }

  if (isAndroidExpoGo()) {
    return { token: null, message: 'Remote push notifications need a development build on Android. Expo Go no longer supports them.' };
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return { token: null, message: 'Notifications are not available in this runtime.' };
  }

  await configureNotificationHandler();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Invyte',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#9333ea',
    });
  }

  if (!Device.isDevice) {
    return { token: null, message: 'Use a physical device or development build for push notifications.' };
  }

  const existingPermissions = await Notifications.getPermissionsAsync();
  let status = existingPermissions.status;

  if (status !== 'granted') {
    const requestedPermissions = await Notifications.requestPermissionsAsync();
    status = requestedPermissions.status;
  }

  if (status !== 'granted') {
    return { token: null, message: 'Notification permission was not granted.' };
  }

  const projectId = getProjectId();
  if (!projectId) {
    return { token: null, message: 'Add an EAS project ID to app config to enable remote push notifications.' };
  }

  const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
  const token = tokenResult.data;

  await setPreference(PUSH_TOKEN_KEY, token);
  await notificationsApi.registerPushToken({
    token,
    platform: Platform.OS as 'ios' | 'android',
    device_name: Device.deviceName,
  });

  return { token, message: 'Push notifications enabled.' };
}

export async function unregisterDeviceForPushNotifications() {
  const token = await getPreference(PUSH_TOKEN_KEY);
  await setPushEnabledPreference(false);

  if (token) {
    await notificationsApi.unregisterPushToken({
      token,
      platform: Platform.OS === 'web' ? 'web' : (Platform.OS as 'ios' | 'android'),
      device_name: Device.deviceName,
    });
  }

  return { token };
}

export async function sendTestLocalNotification() {
  if (isAndroidExpoGo()) {
    return { message: 'Test notifications need a development build on Android. Expo Go no longer supports expo-notifications.' };
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return { message: 'Notifications are not available in this runtime.' };
  }

  await configureNotificationHandler();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Invyte',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const existingPermissions = await Notifications.getPermissionsAsync();
  if (existingPermissions.status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Invyte notifications are on',
      body: 'You will receive RSVP updates, event reminders, and achievement alerts here.',
      data: { type: 'test' },
    },
    trigger: null,
  });

  return { message: 'Test notification sent.' };
}
