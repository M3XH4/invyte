import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useFonts } from 'expo-font';

import { bootstrapApi } from '@/api/bootstrapApi';
import { API_BASE_URL, getApiBaseUrlCandidates } from '@/api/axios';
import { authStore, useAuthStore } from '@/store/authStore';
import { categoryStore } from '@/store/categoryStore';
import { eventStore } from '@/store/eventStore';
import { notificationStore } from '@/store/notificationStore';
import { themeStore } from '@/store/themeStore';

type BootstrapStatus = 'idle' | 'loading' | 'ready' | 'error';

type BootstrapState = {
  status: BootstrapStatus;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  message: string;
  routeTarget: '/tabs' | '/auth-login' | '/getting-started';
  retry: () => void;
};

const AppBootstrapContext = createContext<BootstrapState | null>(null);

async function runOptionalPreload(task: () => Promise<unknown>, label: string) {
  try {
    await task();
  } catch (error: any) {
    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.warn(`[bootstrap] Optional preload failed: ${label}`, error?.message || error);
    }
  }
}

export async function preloadInitialAppData() {
  await bootstrapApi.healthCheck();
}

export async function preloadAuthenticatedAppData() {
  await Promise.all([
    eventStore.fetchEvents({ status: 'all', per_page: 20 }, { hydrate: true }),
    runOptionalPreload(
      () => eventStore.fetchEvents({ status: 'upcoming', per_page: 5 }, { hydrate: true }),
      'upcoming events',
    ),
    runOptionalPreload(() => notificationStore.fetchNotifications(), 'notifications'),
    runOptionalPreload(() => categoryStore.fetchCategories(), 'categories'),
    runOptionalPreload(() => themeStore.fetchThemes(), 'themes'),
  ]);
}

export async function preloadGuestAppData() {
  eventStore.clear();
  notificationStore.clear();
}

function getRouteTarget(auth: ReturnType<typeof authStore.getSnapshot>) {
  if (auth.user && auth.accessToken && !auth.user.is_guest) {
    return auth.user.has_seen_onboarding || auth.user.has_seen_getting_started
      ? '/tabs'
      : '/getting-started';
  }

  return '/auth-login';
}

export function AppBootstrapProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthStore();
  const [fontsLoaded] = useFonts({
    PoppinsRegular: require('@/assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('@/assets/fonts/Poppins-Bold.ttf'),
    PoppinsSemiBold: require('@/assets/fonts/Poppins-SemiBold.ttf'),
  });
  const [status, setStatus] = useState<BootstrapStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('Connecting to the Invyte API...');
  const [attempt, setAttempt] = useState(0);

  const runBootstrap = useCallback(async () => {
    if (!fontsLoaded) return;

    setStatus('loading');
    setError(null);

    try {
      setMessage('Connecting to the Invyte API...');
      await preloadInitialAppData();

      setMessage('Restoring your session...');
      await authStore.initialize();

      const restoredAuth = authStore.getSnapshot();

      if (restoredAuth.accessToken && restoredAuth.user && !restoredAuth.user.is_guest) {
        setMessage('Loading your events...');
        await preloadAuthenticatedAppData();
      } else {
        setMessage('Preparing guest mode...');
        await preloadGuestAppData();
      }

      setStatus('ready');
      setMessage('Ready');
    } catch (error: any) {
      if (error?.status === 401 || error?.status === 422) {
        await authStore.clearAuth({ clearRemember: error?.status === 422 });
        await preloadGuestAppData();
        setStatus('ready');
        setMessage('Ready');
        return;
      }

      const message = error?.message || 'Unable to start the app. Please check your server and try again.';
      setError(message);
      setStatus('error');
    }
  }, [fontsLoaded]);

  useEffect(() => {
    runBootstrap();
  }, [attempt, runBootstrap]);

  const retry = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  const value = useMemo<BootstrapState>(
    () => ({
      status,
      isReady: status === 'ready',
      isLoading: status === 'idle' || status === 'loading' || !fontsLoaded || auth.initializing,
      error,
      message,
      routeTarget: getRouteTarget(auth),
      retry,
    }),
    [auth, error, fontsLoaded, message, retry, status],
  );

  return (
    <AppBootstrapContext.Provider value={value}>
      {children}
    </AppBootstrapContext.Provider>
  );
}

export function useAppBootstrap() {
  const context = useContext(AppBootstrapContext);

  if (!context) {
    throw new Error('useAppBootstrap must be used inside AppBootstrapProvider');
  }

  return context;
}

export function getBootstrapApiUrlLabel() {
  return getApiBaseUrlCandidates().join(' | ') || API_BASE_URL;
}
