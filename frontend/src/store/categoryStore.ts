import { useSyncExternalStore } from 'react';

import { eventsApi } from '@/api/eventsApi';
import type { EventCategory } from '@/types/event';

const METADATA_STALE_MS = 24 * 60 * 60 * 1000;

type CategoryState = {
  categories: EventCategory[];
  isInitialLoaded: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetchedAt: number | null;
};

let state: CategoryState = {
  categories: [],
  isInitialLoaded: false,
  isRefreshing: false,
  error: null,
  lastFetchedAt: null,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(patch: Partial<CategoryState>) {
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

export const categoryStore = {
  subscribe,
  getSnapshot,

  hydrateCategories(categories: EventCategory[]) {
    setState({
      categories: Array.isArray(categories) ? categories : [],
      isInitialLoaded: true,
      lastFetchedAt: Date.now(),
      error: null,
    });
  },

  async fetchCategories(options: { refresh?: boolean } = {}) {
    if (options.refresh) setState({ isRefreshing: true });

    try {
      setState({ error: null });
      const categories = await eventsApi.getCategories();
      categoryStore.hydrateCategories(categories);
      return categories;
    } catch (error: any) {
      setState({ error: error.message || 'Unable to load categories.' });
      throw error;
    } finally {
      setState({ isRefreshing: false });
    }
  },

  async syncIfStale() {
    if (state.lastFetchedAt && Date.now() - state.lastFetchedAt < METADATA_STALE_MS) return null;
    return categoryStore.fetchCategories({ refresh: true });
  },
};

export function useCategoryStore() {
  return useSyncExternalStore(categoryStore.subscribe, categoryStore.getSnapshot, categoryStore.getSnapshot);
}
