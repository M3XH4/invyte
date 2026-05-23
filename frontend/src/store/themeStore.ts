import { useSyncExternalStore } from 'react';

import { eventsApi } from '@/api/eventsApi';
import type { Theme } from '@/types/event';

const METADATA_STALE_MS = 24 * 60 * 60 * 1000;

type ThemeState = {
  themes: Theme[];
  isInitialLoaded: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetchedAt: number | null;
};

let state: ThemeState = {
  themes: [],
  isInitialLoaded: false,
  isRefreshing: false,
  error: null,
  lastFetchedAt: null,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(patch: Partial<ThemeState>) {
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

export const themeStore = {
  subscribe,
  getSnapshot,

  hydrateThemes(themes: Theme[]) {
    setState({
      themes: Array.isArray(themes) ? themes : [],
      isInitialLoaded: true,
      lastFetchedAt: Date.now(),
      error: null,
    });
  },

  async fetchThemes(options: { refresh?: boolean } = {}) {
    if (options.refresh) setState({ isRefreshing: true });

    try {
      setState({ error: null });
      const themes = await eventsApi.getThemes();
      themeStore.hydrateThemes(themes);
      return themes;
    } catch (error: any) {
      setState({ error: error.message || 'Unable to load themes.' });
      throw error;
    } finally {
      setState({ isRefreshing: false });
    }
  },

  async syncIfStale() {
    if (state.lastFetchedAt && Date.now() - state.lastFetchedAt < METADATA_STALE_MS) return null;
    return themeStore.fetchThemes({ refresh: true });
  },
};

export function useThemeStore() {
  return useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot, themeStore.getSnapshot);
}
