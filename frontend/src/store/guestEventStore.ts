import { useSyncExternalStore } from 'react';

import { guestEventsApi, type GuestEvent } from '@/api/guestEventsApi';

type GuestEventState = {
  events: GuestEvent[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
};

let state: GuestEventState = {
  events: [],
  loading: false,
  loaded: false,
  error: null,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(patch: Partial<GuestEventState>) {
  state = { ...state, ...patch };
  emit();
}

export const guestEventStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    return state;
  },

  hydrateGuestEvents(events: GuestEvent[]) {
    setState({ events, loaded: true, error: null });
  },

  async fetchGuestEvents() {
    setState({ loading: true, error: null });
    try {
      const events = await guestEventsApi.list();
      setState({ events, loaded: true });
      return events;
    } catch (error: any) {
      setState({ error: error.message || 'Unable to load guest events.' });
      throw error;
    } finally {
      setState({ loading: false });
    }
  },
};

export function useGuestEventStore() {
  return useSyncExternalStore(guestEventStore.subscribe, guestEventStore.getSnapshot, guestEventStore.getSnapshot);
}
