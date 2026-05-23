import { useCallback, useEffect, useMemo, useState } from 'react';

import { eventsApi } from '@/api/eventsApi';
import { eventStore, useEventStore } from '@/store/eventStore';
import type { PaginationMeta } from '@/types/api';
import type { Event, EventFilters } from '@/types/event';

function canUseHydratedEvents(filters: EventFilters) {
  return !filters.search && (!filters.status || filters.status === 'all');
}

function canUseHydratedUpcoming(filters: EventFilters) {
  return !filters.search && filters.status === 'upcoming';
}

export function useEvents(filters: EventFilters = {}) {
  const store = useEventStore();
  const queryKey = useMemo(() => JSON.stringify(filters), [filters]);
  const memoizedFilters = useMemo(() => JSON.parse(queryKey) as EventFilters, [queryKey]);
  const useHydratedAll = canUseHydratedEvents(memoizedFilters);
  const useHydratedUpcoming = canUseHydratedUpcoming(memoizedFilters);

  const initialEvents = useHydratedUpcoming
    ? store.upcomingEvents
    : useHydratedAll
      ? store.events
      : [];

  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(store.meta);
  const [loading, setLoading] = useState(
    !store.isInitialLoaded && !useHydratedUpcoming && !useHydratedAll,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (useHydratedUpcoming) {
      setEvents(store.upcomingEvents);
      setLoading(false);
    } else if (useHydratedAll) {
      setEvents(store.events);
      setMeta(store.meta);
      setLoading(false);
    }
  }, [store.events, store.meta, store.upcomingEvents, useHydratedAll, useHydratedUpcoming]);

  const load = useCallback(
    async (refresh = false) => {
      const hasHydratedData =
        (useHydratedAll && store.isInitialLoaded) ||
        (useHydratedUpcoming && store.upcomingEvents.length > 0);

      if (refresh) setRefreshing(true);
      else if (!hasHydratedData) setLoading(true);

      try {
        setError(null);
        const response =
          useHydratedAll || useHydratedUpcoming
            ? await eventStore.fetchEvents(memoizedFilters, { refresh, hydrate: true })
            : await eventsApi.list(memoizedFilters);
        const nextEvents = Array.isArray(response?.data) ? response.data : [];
        setEvents(nextEvents);
        setMeta(response.meta);
      } catch (error: any) {
        setError(error.message || 'Unable to load events.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [memoizedFilters, store.isInitialLoaded, store.upcomingEvents.length, useHydratedAll, useHydratedUpcoming],
  );

  useEffect(() => {
    if (useHydratedAll && store.isInitialLoaded) {
      eventStore.syncIfStale(memoizedFilters).catch(() => undefined);
      return;
    }

    if (useHydratedUpcoming && store.upcomingEvents.length > 0) {
      eventStore.syncIfStale(memoizedFilters).catch(() => undefined);
      return;
    }

    load();
  }, [load, memoizedFilters, store.isInitialLoaded, store.upcomingEvents.length, useHydratedAll, useHydratedUpcoming]);

  return {
    events: Array.isArray(events) ? events : [],
    setEvents,
    meta,
    loading,
    refreshing: refreshing || store.isRefreshing,
    error: error || store.error,
    reload: load,
    refresh: () => load(true),
  };
}

export function useEvent(eventId?: string) {
  const store = useEventStore();
  const cachedEvent = eventStore.getEventById(eventId);
  const [event, setEvent] = useState<Event | null>(cachedEvent);
  const [loading, setLoading] = useState(!!eventId && !cachedEvent);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      setError(null);
      const nextEvent = await eventsApi.get(eventId);
      setEvent(nextEvent);
      eventStore.updateEvent(nextEvent);
    } catch (error: any) {
      setError(error.message || 'Unable to load event.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    const nextCachedEvent = eventStore.getEventById(eventId);
    if (nextCachedEvent) {
      setEvent(nextCachedEvent);
      setLoading(false);
      eventStore.syncIfStale().catch(() => undefined);
      return;
    }

    reload();
  }, [eventId, reload]);

  useEffect(() => {
    const nextCachedEvent = eventStore.getEventById(eventId);
    if (nextCachedEvent) setEvent(nextCachedEvent);
  }, [eventId, store.events]);

  return { event, setEvent, loading, error, reload };
}
