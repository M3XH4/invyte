import { useSyncExternalStore } from 'react';

import { authApi } from '@/api/authApi';
import {
  setUnauthorizedHandler,
  tokenStorage,
  USER_CACHE_KEY,
} from '@/api/axios';
import type { AuthPayload, LoginPayload, RegisterPayload, User } from '@/types/auth';

type AuthState = {
  user: User | null;
  token: string | null;
  accessToken: string | null;
  rememberToken: string | null;
  rememberMe: boolean;
  initializing: boolean;
  isRestoringAuth: boolean;
  loading: boolean;
  error: string | null;
};

let state: AuthState = {
  user: null,
  token: null,
  accessToken: null,
  rememberToken: null,
  rememberMe: false,
  initializing: true,
  isRestoringAuth: false,
  loading: false,
  error: null,
};

const listeners = new Set<() => void>();
let initializePromise: Promise<void> | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(patch: Partial<AuthState>) {
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

const userStorage = {
  async getUser() {
    try {
      const raw = await tokenStorage.getSecureValue(USER_CACHE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },

  async setUser(user: User) {
    await tokenStorage.setSecureValue(USER_CACHE_KEY, JSON.stringify(user));
  },

  async clearUser() {
    await tokenStorage.clearSecureValue(USER_CACHE_KEY);
  },
};

function extractAccessToken(payload: AuthPayload) {
  return payload.access_token || payload.token || '';
}

async function persistAuth(payload: AuthPayload, rememberMe = false) {
  const accessToken = extractAccessToken(payload);

  if (!accessToken) {
    throw new Error('Login succeeded but the server did not return an access token.');
  }

  await tokenStorage.setAccessToken(accessToken);
  await userStorage.setUser(payload.user);

  if (rememberMe && payload.remember_token) {
    await tokenStorage.setRememberToken(payload.remember_token);
  } else if (!rememberMe) {
    await tokenStorage.clearRememberToken();
  }

  const rememberToken =
    rememberMe && payload.remember_token
      ? payload.remember_token
      : await tokenStorage.getRememberToken();

  setState({
    token: accessToken,
    accessToken,
    rememberToken,
    rememberMe: !!rememberToken,
    user: payload.user,
    error: null,
  });
}

async function clearAuth(options: { clearRemember?: boolean } = {}) {
  await tokenStorage.clearAccessToken();
  await userStorage.clearUser();
  if (options.clearRemember) await tokenStorage.clearRememberToken();

  const rememberToken = options.clearRemember ? null : await tokenStorage.getRememberToken();

  setState({
    user: null,
    token: null,
    accessToken: null,
    rememberToken,
    rememberMe: !!rememberToken,
    loading: false,
    error: null,
    initializing: false,
    isRestoringAuth: false,
  });
}

setUnauthorizedHandler(() => clearAuth({ clearRemember: false }));

export const authStore = {
  subscribe,
  getSnapshot,

  async loadStoredTokens() {
    const [accessToken, rememberToken, cachedUser] = await Promise.all([
      tokenStorage.getAccessToken(),
      tokenStorage.getRememberToken(),
      userStorage.getUser(),
    ]);

    setState({
      accessToken,
      token: accessToken,
      rememberToken,
      rememberMe: !!rememberToken,
      user: cachedUser,
    });

    return { accessToken, rememberToken, cachedUser };
  },

  initialize() {
    if (initializePromise) return initializePromise;

    initializePromise = (async () => {
      setState({ initializing: true, isRestoringAuth: true, error: null });

      try {
        const { accessToken, rememberToken, cachedUser } = await authStore.loadStoredTokens();

        if (accessToken) {
          setState({ initializing: !cachedUser, isRestoringAuth: true });

          try {
            const user = await authApi.me();
            await userStorage.setUser(user);
            setState({ user, initializing: false, isRestoringAuth: false, error: null });
            return;
          } catch (error: any) {
            if (error?.status !== 401) throw error;
            await tokenStorage.clearAccessToken();
            setState({ token: null, accessToken: null });
          }
        }

        if (rememberToken) {
          await authStore.restoreFromRememberToken(rememberToken);
          setState({ initializing: false, isRestoringAuth: false });
          return;
        }

        setState({
          initializing: false,
          isRestoringAuth: false,
          user: null,
          token: null,
          accessToken: null,
        });
      } catch (error: any) {
        const shouldClearRemember = error?.status === 401 || error?.status === 422;

        await clearAuth({ clearRemember: shouldClearRemember });
        setState({
          initializing: false,
          isRestoringAuth: false,
          error: shouldClearRemember
            ? null
            : error?.message || 'Unable to restore your session right now.',
        });
      } finally {
        initializePromise = null;
      }
    })();

    return initializePromise;
  },

  async login(payload: LoginPayload) {
    setState({ loading: true, error: null });
    try {
      const auth = await authApi.login(payload);
      await persistAuth(auth, !!payload.remember_me);
      setState({ loading: false, initializing: false });
      return auth.user;
    } catch (error: any) {
      setState({ loading: false, error: error.message });
      throw error;
    }
  },

  async register(payload: RegisterPayload) {
    setState({ loading: true, error: null });
    try {
      const auth = await authApi.register(payload);
      await persistAuth(auth, false);
      setState({ loading: false, initializing: false });
      return auth.user;
    } catch (error: any) {
      setState({ loading: false, error: error.message });
      throw error;
    }
  },

  async restoreFromRememberToken(rememberToken = state.rememberToken) {
    if (!rememberToken) return null;

    setState({ isRestoringAuth: true, error: null });
    const auth = await authApi.remember(rememberToken);
    await persistAuth(auth, true);
    setState({ isRestoringAuth: false, initializing: false });

    return auth.user;
  },

  async logout(options: { logoutAll?: boolean; forgetRemember?: boolean } = {}) {
    const forgetRemember = options.forgetRemember ?? true;

    setState({ loading: true, error: null });
    try {
      if (state.accessToken) {
        await authApi.logout({
          logout_all: options.logoutAll,
          forget_remember: forgetRemember,
        });
      }
    } finally {
      await clearAuth({ clearRemember: forgetRemember });
    }
  },

  async refreshUser() {
    if (!state.accessToken) return null;

    const user = await authApi.me();
    await userStorage.setUser(user);
    setState({ user });
    return user;
  },

  async setUser(user: User | null) {
    if (user) await userStorage.setUser(user);
    else await userStorage.clearUser();
    setState({ user });
  },

  clearAuth,
};

export function useAuthStore() {
  return useSyncExternalStore(authStore.subscribe, authStore.getSnapshot, authStore.getSnapshot);
}
