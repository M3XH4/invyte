import { useCallback, useEffect, useMemo, useState } from 'react';

import { guestStore, useGuestStore } from '@/store/guestStore';
import type { EventGuest, GuestFilters } from '@/types/guest';

export function useGuests(eventId?: string, filters: GuestFilters = {}) {
  const store = useGuestStore();
  const [guests, setGuests] = useState<EventGuest[]>(eventId ? store.guestsByEventId[eventId] ?? [] : []);
  const [loading, setLoading] = useState(!!eventId && !(eventId in store.guestsByEventId));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryKey = useMemo(() => JSON.stringify(filters), [filters]);
  const memoizedFilters = useMemo(() => JSON.parse(queryKey) as GuestFilters, [queryKey]);

  const load = useCallback(
    async (refresh = false) => {
      if (!eventId) return;

      if (refresh) setRefreshing(true);
      else setLoading(true);

      try {
        setError(null);
        const response = await guestStore.fetchGuests(eventId, memoizedFilters, { force: refresh });
        setGuests(Array.isArray(response) ? response : []);
      } catch (error: any) {
        setError(error.message || 'Unable to load guests.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [eventId, memoizedFilters],
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!eventId) return;
    setGuests(store.guestsByEventId[eventId] ?? []);
    setLoading(!!store.loadingByEventId[eventId]);
    setError(store.errorByEventId[eventId] ?? null);
  }, [eventId, store.errorByEventId, store.guestsByEventId, store.loadingByEventId]);

  return {
    guests,
    setGuests: (updater: EventGuest[] | ((prev: EventGuest[]) => EventGuest[])) => {
      if (!eventId) return;
      const nextGuests = typeof updater === 'function' ? updater(store.guestsByEventId[eventId] ?? []) : updater;
      guestStore.hydrateGuests(eventId, nextGuests);
    },
    loading,
    refreshing: refreshing || (eventId ? !!store.refreshingByEventId[eventId] : false),
    error,
    reload: load,
    refresh: () => load(true),
  };
}
