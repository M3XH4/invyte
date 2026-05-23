import { useSyncExternalStore } from 'react';

import { guestsApi } from '@/api/guestsApi';
import { eventStore } from '@/store/eventStore';
import { activityLogStore } from '@/store/activityLogStore';
import type { EventGuest, GuestFilters, GuestPayload } from '@/types/guest';
import { normalizeEventRsvpStats } from '@/utils/rsvpStats';

const GUESTS_STALE_MS = 60 * 1000;

type GuestState = {
  guestsByEventId: Record<string, EventGuest[]>;
  loadingByEventId: Record<string, boolean>;
  refreshingByEventId: Record<string, boolean>;
  loadedByEventId: Record<string, boolean>;
  errorByEventId: Record<string, string | null>;
  lastFetchedAtByEventId: Record<string, number>;
};

type FetchOptions = { refresh?: boolean; force?: boolean };

let state: GuestState = {
  guestsByEventId: {},
  loadingByEventId: {},
  refreshingByEventId: {},
  loadedByEventId: {},
  errorByEventId: {},
  lastFetchedAtByEventId: {},
};

const listeners = new Set<() => void>();
const inFlightRequests = new Map<string, Promise<EventGuest[]>>();
let requestSequence = 0;
const latestRequestIdByEventId: Record<string, number> = {};

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(patch: Partial<GuestState>) {
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

function getGuestId(guest: EventGuest) {
  return guest.uuid || guest.id;
}

function normalizeGuestResponse(response: EventGuest | { guest?: EventGuest; event_stats?: any }) {
  if ('guest' in response && response.guest) return response.guest;
  return response as EventGuest;
}

function syncMutationSideEffects(eventId: string, response: EventGuest | { guest?: EventGuest; event_stats?: any; activity_log?: any }) {
  if ('event_stats' in response && response.event_stats) {
    eventStore.updateEventStats(eventId, normalizeEventRsvpStats(response.event_stats));
  }

  if ('activity_log' in response && response.activity_log) {
    activityLogStore.prependLog(eventId, response.activity_log);
  }
}

function setEventGuests(eventId: string, guests: EventGuest[]) {
  const safeGuests = Array.isArray(guests) ? guests : [];
  setState({
    guestsByEventId: { ...state.guestsByEventId, [eventId]: safeGuests },
    loadedByEventId: { ...state.loadedByEventId, [eventId]: true },
    errorByEventId: { ...state.errorByEventId, [eventId]: null },
    lastFetchedAtByEventId: { ...state.lastFetchedAtByEventId, [eventId]: Date.now() },
  });
  eventStore.recalculateEventStats(eventId, safeGuests);
}

export const guestStore = {
  subscribe,
  getSnapshot,

  hydrateGuests(eventId: string, guests: EventGuest[]) {
    if (!eventId) return;
    setEventGuests(eventId, guests);
  },

  async fetchGuests(eventId: string, filters: GuestFilters = {}, options: FetchOptions = {}) {
    if (!eventId) return [];

    const lastFetchedAt = state.lastFetchedAtByEventId[eventId];
    const hasCache = Array.isArray(state.guestsByEventId[eventId]);
    if (!options.force && hasCache && lastFetchedAt && Date.now() - lastFetchedAt < GUESTS_STALE_MS) {
      return state.guestsByEventId[eventId] ?? [];
    }

    const requestKey = JSON.stringify({ eventId, filters });
    if (inFlightRequests.has(requestKey)) return inFlightRequests.get(requestKey)!;
    const requestId = ++requestSequence;
    latestRequestIdByEventId[eventId] = requestId;
    const oldCount = state.guestsByEventId[eventId]?.length ?? 0;
    const isRefresh = !!options.refresh || !!options.force;

    setState({
      loadingByEventId: { ...state.loadingByEventId, [eventId]: !hasCache },
      refreshingByEventId: { ...state.refreshingByEventId, [eventId]: isRefresh && hasCache },
      errorByEventId: { ...state.errorByEventId, [eventId]: null },
    });

    const request = (async () => {
      const response = await guestsApi.list(eventId, { per_page: 100, ...filters });
      const guests = response.data;
      if (!Array.isArray(guests)) throw new Error('Invalid guests response from server.');
      const isLatest = requestId === latestRequestIdByEventId[eventId];

      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.log('[guestStore] loaded guests', {
          eventId,
          oldCount,
          newCount: guests.length,
          requestId,
          isLatest,
          keys: Object.keys(state.guestsByEventId),
        });
      }

      if (isLatest) setEventGuests(eventId, guests);
      return guests;
    })();

    inFlightRequests.set(requestKey, request);

    try {
      return await request;
    } catch (error: any) {
      setState({
        errorByEventId: {
          ...state.errorByEventId,
          [eventId]: error.message || 'Unable to load guests.',
        },
      });
      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.log('[guestStore] preserved old guests after failed fetch', {
          eventId,
          oldCount: state.guestsByEventId[eventId]?.length ?? 0,
          requestId,
          message: error.message,
        });
      }
      throw error;
    } finally {
      inFlightRequests.delete(requestKey);
      if (requestId === latestRequestIdByEventId[eventId]) {
        setState({
          loadingByEventId: { ...state.loadingByEventId, [eventId]: false },
          refreshingByEventId: { ...state.refreshingByEventId, [eventId]: false },
        });
      }
    }
  },

  async refreshGuests(eventId: string, filters: GuestFilters = {}) {
    return guestStore.fetchGuests(eventId, filters, { force: true, refresh: true });
  },

  async fetchGuestDetails(eventId: string, guestId: string) {
    if (!eventId || !guestId) throw new Error('Guest is required.');
    const response = await guestsApi.detail(eventId, guestId);
    const guest = response.guest;
    const current = state.guestsByEventId[eventId] ?? [];
    const exists = current.some((item) => getGuestId(item) === getGuestId(guest));
    const guests = exists
      ? current.map((item) => (getGuestId(item) === getGuestId(guest) ? guest : item))
      : [...current, guest];
    setEventGuests(eventId, guests);
    return guest;
  },

  async addGuest(eventId: string, payload: GuestPayload) {
    if (!eventId) throw new Error('Event is required.');

    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.log('[guestStore] create guest payload', { eventId, payload });
    }

    const response = await guestsApi.create(eventId, payload);
    const guest = normalizeGuestResponse(response);
    const current = state.guestsByEventId[eventId] ?? [];
    const exists = current.some((item) => getGuestId(item) === getGuestId(guest));
    const guests = exists
      ? current.map((item) => (getGuestId(item) === getGuestId(guest) ? guest : item))
      : [...current, guest];

    setEventGuests(eventId, guests);
    syncMutationSideEffects(eventId, response);

    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.log('[guestStore] guest added', { eventId, guestId: guest.id, count: guests.length });
    }

    return guest;
  },

  async updateGuest(eventId: string, guestId: string, payload: Partial<GuestPayload>) {
    if (!eventId || !guestId) throw new Error('Guest is required.');
    const response = await guestsApi.update(eventId, guestId, payload);
    const guest = normalizeGuestResponse(response);
    const guests = (state.guestsByEventId[eventId] ?? []).map((item) =>
      getGuestId(item) === guestId ? guest : item,
    );
    setEventGuests(eventId, guests);
    syncMutationSideEffects(eventId, response);
    return guest;
  },

  async updateAttendance(eventId: string, guestId: string, attended: boolean) {
    if (!eventId || !guestId) throw new Error('Guest is required.');
    const response = await guestsApi.updateAttendance(eventId, guestId, attended);
    const guest = normalizeGuestResponse(response);
    const guests = (state.guestsByEventId[eventId] ?? []).map((item) =>
      getGuestId(item) === guestId ? guest : item,
    );
    setEventGuests(eventId, guests);
    syncMutationSideEffects(eventId, response);
    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.log('[guestStore] attendance updated', { eventId, guestId, attended, guest });
    }
    return guest;
  },

  async deleteGuest(eventId: string, guestId: string) {
    if (!eventId || !guestId) throw new Error('Guest is required.');
    const response = await guestsApi.delete(eventId, guestId);
    const guests = (state.guestsByEventId[eventId] ?? []).filter((item) => getGuestId(item) !== guestId);
    setEventGuests(eventId, guests);
    if (response && typeof response === 'object') syncMutationSideEffects(eventId, response as any);
    return true;
  },

  clearEvent(eventId: string) {
    const { [eventId]: _guests, ...guestsByEventId } = state.guestsByEventId;
    const { [eventId]: _loading, ...loadingByEventId } = state.loadingByEventId;
    const { [eventId]: _refreshing, ...refreshingByEventId } = state.refreshingByEventId;
    const { [eventId]: _loaded, ...loadedByEventId } = state.loadedByEventId;
    const { [eventId]: _error, ...errorByEventId } = state.errorByEventId;
    const { [eventId]: _lastFetched, ...lastFetchedAtByEventId } = state.lastFetchedAtByEventId;
    setState({ guestsByEventId, loadingByEventId, refreshingByEventId, loadedByEventId, errorByEventId, lastFetchedAtByEventId });
  },

  clear() {
    setState({
      guestsByEventId: {},
      loadingByEventId: {},
      refreshingByEventId: {},
      loadedByEventId: {},
      errorByEventId: {},
      lastFetchedAtByEventId: {},
    });
  },
};

export function useGuestStore() {
  return useSyncExternalStore(guestStore.subscribe, guestStore.getSnapshot, guestStore.getSnapshot);
}
