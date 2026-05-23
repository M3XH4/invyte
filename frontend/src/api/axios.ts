import axios, { AxiosError, create as createAxios, type AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { ApiError, type ApiResponse } from '@/types/api';

export const ACCESS_TOKEN_KEY = 'invyte_access_token';
export const REMEMBER_TOKEN_KEY = 'invyte_remember_token';
export const USER_CACHE_KEY = 'invyte_auth_user';
const LEGACY_TOKEN_KEY = 'invyte_sanctum_token';
const DEFAULT_API_URL = 'http://127.0.0.1:8000/api';

let unauthorizedHandler: (() => void | Promise<void>) | null = null;
let workingBaseUrl: string | null = null;

function normalizeApiBaseUrl(url?: string | null) {
  const normalized = (url || DEFAULT_API_URL).replace(/\/$/, '');

  if (
    typeof __DEV__ !== 'undefined' &&
    __DEV__ &&
    /:800\/api$/.test(normalized)
  ) {
    return normalized.replace(':800/api', ':8000/api');
  }

  return normalized;
}

export const API_BASE_URL = normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_URL);

function getExpoHost() {
  const hostUri =
    (Constants as any).expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  return typeof hostUri === 'string' ? hostUri.split(':')[0] : null;
}

function uniqueUrls(urls: (string | null | undefined)[]) {
  return Array.from(new Set(urls.filter(Boolean).map((url) => url!.replace(/\/$/, ''))));
}

export function getApiBaseUrlCandidates() {
  const expoHost = getExpoHost();
  const isDev = typeof __DEV__ === 'undefined' || __DEV__;

  return uniqueUrls([
    workingBaseUrl,
    isDev && expoHost ? `http://${expoHost}:8000/api` : null,
    API_BASE_URL,
    Platform.OS === 'android' ? 'http://10.0.2.2:8000/api' : null,
    'http://localhost:8000/api',
    'http://127.0.0.1:8000/api',
  ]);
}

export const tokenStorage = {
  async getSecureValue(key: string) {
    if (Platform.OS === 'web') {
      return globalThis.localStorage?.getItem(key) ?? null;
    }

    const available = await SecureStore.isAvailableAsync();
    return available ? SecureStore.getItemAsync(key) : null;
  },

  async setSecureValue(key: string, value: string) {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(key, value);
      return;
    }

    const available = await SecureStore.isAvailableAsync();
    if (available) await SecureStore.setItemAsync(key, value);
  },

  async clearSecureValue(key: string) {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(key);
      return;
    }

    const available = await SecureStore.isAvailableAsync();
    if (available) await SecureStore.deleteItemAsync(key);
  },

  async getToken() {
    return this.getAccessToken();
  },

  async setToken(token: string) {
    return this.setAccessToken(token);
  },

  async clearToken() {
    return this.clearAccessToken();
  },

  async getAccessToken() {
    const token = await this.getSecureValue(ACCESS_TOKEN_KEY);
    if (token) return token;

    const legacyToken = await this.getSecureValue(LEGACY_TOKEN_KEY);
    if (legacyToken) {
      await this.setAccessToken(legacyToken);
      await this.clearSecureValue(LEGACY_TOKEN_KEY);
    }

    return legacyToken;
  },

  async setAccessToken(token: string) {
    await this.setSecureValue(ACCESS_TOKEN_KEY, token);
  },

  async clearAccessToken() {
    await this.clearSecureValue(ACCESS_TOKEN_KEY);
    await this.clearSecureValue(LEGACY_TOKEN_KEY);
  },

  async getRememberToken() {
    return this.getSecureValue(REMEMBER_TOKEN_KEY);
  },

  async setRememberToken(token: string) {
    await this.setSecureValue(REMEMBER_TOKEN_KEY, token);
  },

  async clearRememberToken() {
    await this.clearSecureValue(REMEMBER_TOKEN_KEY);
  },
};

export const apiClient = createAxios({
  baseURL: getApiBaseUrlCandidates()[0] || API_BASE_URL,
  timeout: 7000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

function isNetworkFailure(error: AxiosError<ApiResponse<unknown>>) {
  return !error.response && (
    error.message === 'Network Error' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ERR_NETWORK'
  );
}

async function retryWithBaseUrlFallbacks(error: AxiosError<ApiResponse<unknown>>) {
  const config = error.config as (AxiosRequestConfig & { __triedBaseUrls?: boolean }) | undefined;

  if (!config || config.__triedBaseUrls || !isNetworkFailure(error)) {
    return null;
  }

  const currentBaseUrl = String(config.baseURL || API_BASE_URL).replace(/\/$/, '');
  const candidates = getApiBaseUrlCandidates().filter((candidate) => candidate !== currentBaseUrl);

  for (const candidate of candidates) {
    try {
      const response = await axios.request({
        ...config,
        baseURL: candidate,
        __triedBaseUrls: true,
      } as AxiosRequestConfig);
      workingBaseUrl = candidate;
      apiClient.defaults.baseURL = candidate;
      return response;
    } catch (candidateError: any) {
      if (candidateError?.response) {
        workingBaseUrl = candidate;
        apiClient.defaults.baseURL = candidate;
        throw candidateError;
      }

      // Try the next common Expo/Laravel development host.
    }
  }

  return null;
}

apiClient.interceptors.request.use(async (config) => {
  (config as AxiosRequestConfig & { __startedAt?: number }).__startedAt = Date.now();
  const token = await tokenStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    (config.headers as any)?.delete?.('Content-Type');
    delete (config.headers as any)?.['Content-Type'];
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (typeof __DEV__ === 'undefined' || __DEV__) {
      const startedAt = (response.config as AxiosRequestConfig & { __startedAt?: number }).__startedAt;
      const duration = startedAt ? Date.now() - startedAt : undefined;
      console.log(
        `[API] ${response.config.method?.toUpperCase() || 'GET'} ${response.config.url} completed${duration !== undefined ? ` in ${duration}ms` : ''}`,
      );
    }

    return response;
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    let requestError = error;
    let fallbackResponse = null;

    try {
      fallbackResponse = await retryWithBaseUrlFallbacks(error);
    } catch (fallbackError: any) {
      requestError = fallbackError;
    }

    if (fallbackResponse) return fallbackResponse;

    if (typeof __DEV__ === 'undefined' || __DEV__) {
      const startedAt = (requestError.config as AxiosRequestConfig & { __startedAt?: number } | undefined)?.__startedAt;
      const duration = startedAt ? Date.now() - startedAt : undefined;
      console.log('[API] request failed', {
        method: requestError.config?.method?.toUpperCase(),
        url: requestError.config?.url,
        baseURL: requestError.config?.baseURL,
        duration,
        status: requestError.response?.status,
        message: requestError.message,
      });
    }

    if (requestError.response?.status === 401) {
      await tokenStorage.clearToken();
      await unauthorizedHandler?.();
      router.replace('/auth-login');
    }

    const requestUrl = `${String(requestError.config?.baseURL || apiClient.defaults.baseURL || API_BASE_URL).replace(/\/$/, '')}${requestError.config?.url || ''}`;
    const message =
      requestError.response?.data?.message ||
      (isNetworkFailure(requestError)
        ? `Network Error while calling ${requestError.config?.method?.toUpperCase() || 'GET'} ${requestUrl}`
        : requestError.message) ||
      'Something went wrong. Please try again.';

    throw new ApiError(message, requestError.response?.status, requestError.response?.data?.errors);
  },
);

export function setUnauthorizedHandler(handler: () => void | Promise<void>) {
  unauthorizedHandler = handler;
}

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

export const api = {
  async get<T>(url: string, config?: AxiosRequestConfig) {
    return unwrap<T>(await apiClient.get<ApiResponse<T>>(url, config));
  },

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return unwrap<T>(await apiClient.post<ApiResponse<T>>(url, data, config));
  },

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return unwrap<T>(await apiClient.put<ApiResponse<T>>(url, data, config));
  },

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return unwrap<T>(await apiClient.patch<ApiResponse<T>>(url, data, config));
  },

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    return unwrap<T>(await apiClient.delete<ApiResponse<T>>(url, config));
  },
};
