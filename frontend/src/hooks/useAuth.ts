import { useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';

import { authApi } from '@/api/authApi';
import { preloadAuthenticatedAppData } from '@/hooks/useAppBootstrap';
import { authStore, useAuthStore } from '@/store/authStore';
import { eventStore } from '@/store/eventStore';
import { notificationStore } from '@/store/notificationStore';

export function useAuth() {
  const router = useRouter();
  const state = useAuthStore();

  useEffect(() => {
    if (state.initializing) {
      authStore.initialize();
    }
  }, [state.initializing]);

  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      const user = await authStore.login({
        email,
        password,
        remember_me: rememberMe,
        device_name: 'expo-mobile',
      });
      await preloadAuthenticatedAppData();
      router.replace(user.has_seen_onboarding ? '/tabs' : '/getting-started');
    },
    [router],
  );

  const register = useCallback(
    async (payload: {
      name: string;
      username?: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => {
      const user = await authStore.register({ ...payload, device_name: 'expo-mobile' });
      await preloadAuthenticatedAppData();
      router.replace(user.has_seen_onboarding ? '/tabs' : '/getting-started');
    },
    [router],
  );

  const logout = useCallback(async () => {
    await authStore.logout();
    eventStore.clear();
    notificationStore.clear();
    router.replace('/auth-login');
  }, [router]);

  return {
    ...state,
    isAuthenticated: !!state.accessToken && !!state.user && !state.user.is_guest,
    isGuest: !state.token || !!state.user?.is_guest,
    login,
    register,
    logout,
    forgotPassword: authApi.forgotPassword,
    verifyCode: authApi.verifyCode,
    resetPassword: authApi.resetPassword,
    getAuthenticatedUser: authStore.refreshUser,
    requireAuth: (redirectTo = '/auth-login') => {
      if (!state.initializing && !state.accessToken) {
        router.replace(redirectTo as any);
        return false;
      }

      return true;
    },
  };
}
