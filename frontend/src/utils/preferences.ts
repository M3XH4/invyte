import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export async function getPreference(key: string) {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  const available = await SecureStore.isAvailableAsync();
  return available ? SecureStore.getItemAsync(key) : null;
}

export async function setPreference(key: string, value: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }

  const available = await SecureStore.isAvailableAsync();
  if (available) await SecureStore.setItemAsync(key, value);
}
