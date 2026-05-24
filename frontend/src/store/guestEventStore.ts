import { useSyncExternalStore } from 'react';

import { guestEventsApi, type GuestEvent } from '@/api/guestEventsApi';
import { eventStore } from '@/store/eventStore';
import type { RSVPSubmissionPayload } from '@/types/rsvp';
import { normalizeEventRsvpStats } from '@/utils/rsvpStats';

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

  addGuestEvent(event: GuestEvent) {
    const eventId = event.event.uuid || event.event.id;
    const exists = state.events.some((item) => (item.event.uuid || item.event.id) === eventId);
    setState({
      events: exists
        ? state.events.map((item) => ((item.event.uuid || item.event.id) === eventId ? event : item))
        : [event, ...state.events],
      loaded: true,
      error: null,
    });
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

  async updateOwnRsvp(eventId: string, payload: Pick<RSVPSubmissionPayload, 'response_status' | 'plus_ones' | 'answers'>) {
    const response = await guestEventsApi.updateMyRsvp(eventId, payload);
    const eventStats = response.event_stats ? normalizeEventRsvpStats(response.event_stats as any) : null;

    if (eventStats) eventStore.updateEventStats(eventId, eventStats);

    setState({
      events: state.events.map((item) => {
        const itemEventId = item.event.uuid || item.event.id;
        if (itemEventId !== eventId) return item;

        return {
          ...item,
          guest: response.guest,
          permissions: {
            ...item.permissions,
            ...(response.permissions || {}),
          },
        };
      }),
      loaded: true,
      error: null,
    });

    return response;
  },
};

export function useGuestEventStore() {
  return useSyncExternalStore(guestEventStore.subscribe, guestEventStore.getSnapshot, guestEventStore.getSnapshot);
}
