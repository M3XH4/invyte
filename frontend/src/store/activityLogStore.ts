import { useSyncExternalStore } from 'react';

import { activityLogsApi } from '@/api/activityLogsApi';
import type { ActivityLog } from '@/types/event';

type ActivityLogState = {
  logsByEventId: Record<string, ActivityLog[]>;
  loadingByEventId: Record<string, boolean>;
  loadedByEventId: Record<string, boolean>;
  errorByEventId: Record<string, string | null>;
};

let state: ActivityLogState = {
  logsByEventId: {},
  loadingByEventId: {},
  loadedByEventId: {},
  errorByEventId: {},
};

const listeners = new Set<() => void>();
const inFlightRequests = new Map<string, Promise<ActivityLog[]>>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(patch: Partial<ActivityLogState>) {
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

function sortLogs(logs: ActivityLog[]) {
  return [...logs].sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
  );
}

export const activityLogStore = {
  subscribe,
  getSnapshot,

  hydrateActivityLogs(eventId: string, logs: ActivityLog[]) {
    if (!eventId) return;
    const safeLogs = Array.isArray(logs) ? sortLogs(logs) : [];
    setState({
      logsByEventId: { ...state.logsByEventId, [eventId]: safeLogs },
      loadedByEventId: { ...state.loadedByEventId, [eventId]: true },
      errorByEventId: { ...state.errorByEventId, [eventId]: null },
    });
  },

  prependLog(eventId: string, log?: ActivityLog | null) {
    if (!eventId || !log) return;
    const current = state.logsByEventId[eventId] ?? [];
    const exists = current.some((item) => item.id === log.id);
    const logs = exists ? current.map((item) => (item.id === log.id ? log : item)) : [log, ...current];
    activityLogStore.hydrateActivityLogs(eventId, logs);

    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.log('[activityLogStore] prepended log', {
        eventId,
        action: log.action,
        count: logs.length,
      });
    }
  },

  async fetchActivityLogs(eventId: string, options: { force?: boolean } = {}) {
    if (!eventId) return [];
    if (!options.force && state.loadedByEventId[eventId]) return state.logsByEventId[eventId] ?? [];
    if (inFlightRequests.has(eventId)) return inFlightRequests.get(eventId)!;

    setState({
      loadingByEventId: { ...state.loadingByEventId, [eventId]: true },
      errorByEventId: { ...state.errorByEventId, [eventId]: null },
    });

    const request = (async () => {
      const logs = await activityLogsApi.getEventActivityLogs(eventId);
      activityLogStore.hydrateActivityLogs(eventId, logs);

      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.log('[activityLogStore] loaded logs', {
          eventId,
          count: logs.length,
          latest: logs[0]?.action,
        });
      }

      return logs;
    })();

    inFlightRequests.set(eventId, request);

    try {
      return await request;
    } catch (error: any) {
      setState({
        errorByEventId: {
          ...state.errorByEventId,
          [eventId]: error.message || 'Unable to load updates.',
        },
      });
      throw error;
    } finally {
      inFlightRequests.delete(eventId);
      setState({
        loadingByEventId: { ...state.loadingByEventId, [eventId]: false },
      });
    }
  },

  clearEvent(eventId: string) {
    const { [eventId]: _logs, ...logsByEventId } = state.logsByEventId;
    const { [eventId]: _loading, ...loadingByEventId } = state.loadingByEventId;
    const { [eventId]: _loaded, ...loadedByEventId } = state.loadedByEventId;
    const { [eventId]: _error, ...errorByEventId } = state.errorByEventId;
    setState({ logsByEventId, loadingByEventId, loadedByEventId, errorByEventId });
  },
};

export function useActivityLogStore() {
  return useSyncExternalStore(activityLogStore.subscribe, activityLogStore.getSnapshot, activityLogStore.getSnapshot);
}
