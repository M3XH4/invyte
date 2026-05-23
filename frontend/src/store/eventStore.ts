import { useSyncExternalStore } from 'react';

import { eventsApi } from '@/api/eventsApi';
import type { PaginationMeta } from '@/types/api';
import type { Event, EventFilters } from '@/types/event';
import { deriveEventStatsFromGuests, normalizeEvent, normalizeEventRsvpStats } from '@/utils/rsvpStats';

const EVENTS_STALE_MS = 2 * 60 * 1000;

type EventState = {
  events: Event[];
  archivedEvents: Event[];
  upcomingEvents: Event[];
  meta?: PaginationMeta;
  isInitialLoaded: boolean;
  isLoadingInitial: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  upcomingLastFetchedAt: number | null;
};

type FetchOptions = { refresh?: boolean; hydrate?: boolean };

let state: EventState = {
  events: [],
  archivedEvents: [],
  upcomingEvents: [],
  isInitialLoaded: false,
  isLoadingInitial: false,
  isRefreshing: false,
  error: null,
  lastFetchedAt: null,
  upcomingLastFetchedAt: null,
};

const listeners = new Set<() => void>();
const inFlightRequests = new Map<string, Promise<any>>();
let eventsRequestSequence = 0;
const latestEventsRequestIdsByScope: Record<string, number> = {};

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(patch: Partial<EventState>) {
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

function isDefaultEventsFilter(filters: EventFilters = {}) {
  return (!filters.search || filters.search.length === 0) && (!filters.status || filters.status === 'all');
}

function isUpcomingFilter(filters: EventFilters = {}) {
  return !filters.search && filters.status === 'upcoming';
}

function isArchivedFilter(filters: EventFilters = {}) {
  return !filters.search && filters.status === 'archived';
}

function requestScope(filters: EventFilters = {}, options: FetchOptions = {}) {
  if (options.hydrate === false) return `readonly:${JSON.stringify(filters)}`;
  if (isDefaultEventsFilter(filters)) return 'events:all';
  if (isUpcomingFilter(filters)) return 'events:upcoming';
  if (isArchivedFilter(filters)) return 'events:archived';
  return `events:filtered:${JSON.stringify(filters)}`;
}

function eventKey(event: Event) {
  return event.uuid || event.id;
}

function getEventDateTime(event: Event) {
  const date = event.start_date || event.date;
  const time = event.start_time || event.time || '00:00';
  return date ? new Date(`${date}T${String(time).slice(0, 5)}:00`) : null;
}

function isUpcomingEvent(event: Event) {
  if (event.status === 'upcoming') return true;
  const value = getEventDateTime(event);
  return !!value && value.getTime() > Date.now();
}

function sortUpcomingEvents(events: Event[]) {
  return events
    .filter(isUpcomingEvent)
    .sort((a, b) => (getEventDateTime(a)?.getTime() || 0) - (getEventDateTime(b)?.getTime() || 0));
}

function mergeEvent(events: Event[], event: Event) {
  const key = eventKey(event);
  const exists = events.some((item) => eventKey(item) === key);
  const next = exists
    ? events.map((item) => (eventKey(item) === key ? { ...item, ...event } : item))
    : [event, ...events];

  return next.sort((a, b) => (getEventDateTime(a)?.getTime() || 0) - (getEventDateTime(b)?.getTime() || 0));
}

export const eventStore = {
  subscribe,
  getSnapshot,

  hydrateEvents(events: Event[], meta?: PaginationMeta) {
    if (!Array.isArray(events)) {
      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.log('[eventStore.hydrateEvents] skipped invalid events payload', { previousCount: state.events.length });
      }
      return;
    }

    const safeEvents = events.map(normalizeEvent);
    setState({
      events: safeEvents,
      upcomingEvents: sortUpcomingEvents(safeEvents).slice(0, 5),
      meta,
      isInitialLoaded: true,
      isLoadingInitial: false,
      lastFetchedAt: Date.now(),
      upcomingLastFetchedAt: Date.now(),
      error: null,
    });
  },

  hydrateArchivedEvents(events: Event[], meta?: PaginationMeta) {
    if (!Array.isArray(events)) return;
    setState({
      archivedEvents: events.map(normalizeEvent),
      meta,
      isInitialLoaded: true,
      isLoadingInitial: false,
      lastFetchedAt: Date.now(),
      error: null,
    });
  },

  hydrateUpcomingEvents(events: Event[]) {
    if (!Array.isArray(events)) return;
    setState({
      upcomingEvents: events,
      upcomingLastFetchedAt: Date.now(),
      error: null,
    });
  },

  addEvent(event: Event) {
    const events = mergeEvent(state.events, normalizeEvent(event));
    setState({
      events,
      upcomingEvents: sortUpcomingEvents(events).slice(0, 5),
      isInitialLoaded: true,
      lastFetchedAt: Date.now(),
      upcomingLastFetchedAt: Date.now(),
      error: null,
    });

    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.log('[eventStore] added event', {
        eventId: eventKey(event),
        title: event.title,
        totalEvents: events.length,
      });
    }
  },

  updateEvent(event: Event) {
    eventStore.addEvent(event);
  },

  removeEvent(eventId: string) {
    const events = state.events.filter((event) => eventKey(event) !== eventId && event.id !== eventId && event.uuid !== eventId);
    const archivedEvents = state.archivedEvents.filter((event) => eventKey(event) !== eventId && event.id !== eventId && event.uuid !== eventId);
    setState({
      events,
      archivedEvents,
      upcomingEvents: sortUpcomingEvents(events).slice(0, 5),
      lastFetchedAt: Date.now(),
      upcomingLastFetchedAt: Date.now(),
    });
  },

  async archiveEvent(eventId: string) {
    const archived = await eventsApi.archive(eventId);
    const events = state.events.filter((event) => eventKey(event) !== eventId && event.id !== eventId && event.uuid !== eventId);
    const archivedEvents = mergeEvent(state.archivedEvents, archived);
    setState({ events, archivedEvents, upcomingEvents: sortUpcomingEvents(events).slice(0, 5) });
    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.log('[eventStore] event archived', { eventId, activeCount: events.length, archivedCount: archivedEvents.length });
    }
    return archived;
  },

  async restoreEvent(eventId: string) {
    const restored = await eventsApi.restore(eventId);
    const archivedEvents = state.archivedEvents.filter((event) => eventKey(event) !== eventId && event.id !== eventId && event.uuid !== eventId);
    const events = mergeEvent(state.events, restored);
    setState({ events, archivedEvents, upcomingEvents: sortUpcomingEvents(events).slice(0, 5) });
    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.log('[eventStore] event restored', { eventId, activeCount: events.length, archivedCount: archivedEvents.length });
    }
    return restored;
  },

  async permanentlyDeleteEvent(eventId: string) {
    await eventsApi.permanentlyDelete(eventId);
    const events = state.events.filter((event) => eventKey(event) !== eventId && event.id !== eventId && event.uuid !== eventId);
    const archivedEvents = state.archivedEvents.filter((event) => eventKey(event) !== eventId && event.id !== eventId && event.uuid !== eventId);
    setState({ events, archivedEvents, upcomingEvents: sortUpcomingEvents(events).slice(0, 5) });
    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.log('[eventStore] event permanently deleted', { eventId, activeCount: events.length, archivedCount: archivedEvents.length });
    }
  },

  async fetchArchivedEvents(options: FetchOptions = {}) {
    return eventStore.fetchEvents({ status: 'archived', per_page: 50 }, { ...options, refresh: true });
  },

  getEventById(eventId?: string) {
    if (!eventId) return null;
    return state.events.find((event) => eventKey(event) === eventId || event.id === eventId || event.uuid === eventId) ?? null;
  },

  selectUpcomingEvents(limit?: number) {
    const upcoming = sortUpcomingEvents(state.events);
    return typeof limit === 'number' ? upcoming.slice(0, limit) : upcoming;
  },

  selectHeroEvent() {
    return eventStore.selectUpcomingEvents(1)[0] ?? null;
  },

  selectEventStats() {
    return state.events.reduce(
      (stats, event) => ({
        totalEvents: stats.totalEvents + 1,
        upcoming: stats.upcoming + (isUpcomingEvent(event) ? 1 : 0),
        totalGoing: stats.totalGoing + (event.rsvp?.going ?? 0),
        totalInvited: stats.totalInvited + (event.totalInvited ?? event.total_invited ?? 0),
      }),
      { totalEvents: 0, upcoming: 0, totalGoing: 0, totalInvited: 0 },
    );
  },

  updateEventStats(
    eventId: string,
    stats: Partial<Event['rsvp']> & { totalInvited?: number; total_invited?: number },
  ) {
    const nextEvents = state.events.map((event) => {
      if (eventKey(event) !== eventId && event.id !== eventId && event.uuid !== eventId) return event;

      const normalized = normalizeEventRsvpStats({
        ...(event.rsvp || {}),
        ...stats,
        totalInvited: stats.totalInvited ?? stats.total_invited ?? event.totalInvited,
        total_invited: stats.total_invited ?? stats.totalInvited ?? event.total_invited,
      });

      return {
        ...event,
        rsvp: {
          going: normalized.going,
          maybe: normalized.maybe,
          notGoing: normalized.notGoing,
          not_going: normalized.notGoing,
          pending: normalized.pending,
        },
        totalInvited: normalized.totalInvited,
        total_invited: normalized.totalInvited,
        responseRate: normalized.responseRate,
        response_rate: normalized.responseRate,
      };
    });

    setState({
      events: nextEvents,
      upcomingEvents: sortUpcomingEvents(nextEvents).slice(0, 5),
    });

    if (typeof __DEV__ === 'undefined' || __DEV__) {
      const updatedEvent = nextEvents.find((event) => eventKey(event) === eventId || event.id === eventId || event.uuid === eventId);
      console.log('[eventStore.updateEventStats] stats synced', {
        eventId,
        eventsCount: nextEvents.length,
        rsvp: updatedEvent?.rsvp,
        totalInvited: updatedEvent?.totalInvited,
      });
    }
  },

  recalculateEventStats(eventId: string, guests: { response_status?: string | null; status?: string | null }[]) {
    eventStore.updateEventStats(eventId, deriveEventStatsFromGuests(Array.isArray(guests) ? guests as any : []));
  },

  setEventsLoading(isRefreshing = false) {
    setState({ isRefreshing, isLoadingInitial: !isRefreshing && !state.isInitialLoaded });
  },

  setEventsError(error: string | null) {
    setState({ error });
  },

  async fetchEvents(filters: EventFilters = {}, options: FetchOptions = {}) {
    const requestKey = JSON.stringify({ filters, hydrate: options.hydrate !== false });
    if (inFlightRequests.has(requestKey)) return inFlightRequests.get(requestKey)!;

    const scope = requestScope(filters, options);
    const requestId = ++eventsRequestSequence;
    latestEventsRequestIdsByScope[scope] = requestId;
    const isRefresh = !!options.refresh;
    const isInitialLoad = !state.isInitialLoaded && !isRefresh;
    const oldCount = state.events.length;

    setState({
      isRefreshing: isRefresh,
      isLoadingInitial: isInitialLoad,
      error: null,
    });

    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.log('[eventStore.fetchEvents] start', {
        requestId,
        scope,
        oldCount,
        filters,
        refresh: isRefresh,
      });
    }

    const request = (async () => {
      const startedAt = Date.now();
      const response = await eventsApi.list(filters);
      const events = response.data;

      if (!Array.isArray(events)) {
        throw new Error('Invalid events response from server.');
      }

      const isLatestRequest = requestId === latestEventsRequestIdsByScope[scope];

      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.log('[eventStore.fetchEvents] response', {
          requestId,
          latestRequestIdForScope: latestEventsRequestIdsByScope[scope],
          scope,
          oldCount,
          newCount: events.length,
          duration: Date.now() - startedAt,
          filters,
          willUpdateStore: isLatestRequest,
        });
      }

      if (!isLatestRequest) return response;

      if (options.hydrate !== false && isDefaultEventsFilter(filters)) {
        eventStore.hydrateEvents(events, response.meta);
      } else if (options.hydrate !== false && isArchivedFilter(filters)) {
        eventStore.hydrateArchivedEvents(events, response.meta);
      } else if (options.hydrate !== false && isUpcomingFilter(filters)) {
        eventStore.hydrateUpcomingEvents(events);
      }

      return response;
    })();

    inFlightRequests.set(requestKey, request);

    try {
      return await request;
    } catch (error: any) {
      setState({
        error: error.message || 'Unable to load events.',
        isLoadingInitial: false,
      });

      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.log('[eventStore.fetchEvents] preserved old events after error', {
          requestId,
          oldCount: state.events.length,
          message: error.message,
        });
      }

      throw error;
    } finally {
      inFlightRequests.delete(requestKey);
      if (requestId === latestEventsRequestIdsByScope[scope]) {
        setState({ isRefreshing: false, isLoadingInitial: false });
      }
    }
  },

  async refreshEvents(filters: EventFilters = {}) {
    return eventStore.fetchEvents(filters, { refresh: true });
  },

  async syncIfStale(filters: EventFilters = {}) {
    const staleAt = isUpcomingFilter(filters) ? state.upcomingLastFetchedAt : state.lastFetchedAt;
    if (staleAt && Date.now() - staleAt < EVENTS_STALE_MS) return null;

    return eventStore.fetchEvents(filters, { refresh: true });
  },

  clear() {
    setState({
      events: [],
      archivedEvents: [],
      upcomingEvents: [],
      meta: undefined,
      isInitialLoaded: false,
      isLoadingInitial: false,
      isRefreshing: false,
      error: null,
      lastFetchedAt: null,
      upcomingLastFetchedAt: null,
    });
  },
};

export function useEventStore() {
  return useSyncExternalStore(eventStore.subscribe, eventStore.getSnapshot, eventStore.getSnapshot);
}
