import { API_BASE_URL, api, apiClient } from './axios';
import type { PaginatedResponse } from '@/types/api';
import type { ActivityLog, Event, EventCategory, EventFilters, EventPayload, QRCodePayload, Theme } from '@/types/event';
import type { RSVPQuestion } from '@/types/rsvp';
import { normalizeEvent } from '@/utils/rsvpStats';

export function normalizeEventsResponse(response: unknown): Event[] {
  if (Array.isArray(response)) return (response as Event[]).map(normalizeEvent);

  const payload = response as any;
  if (Array.isArray(payload?.data)) return (payload.data as Event[]).map(normalizeEvent);
  if (Array.isArray(payload?.data?.data)) return (payload.data.data as Event[]).map(normalizeEvent);
  if (Array.isArray(payload?.events)) return (payload.events as Event[]).map(normalizeEvent);

  throw new Error('Invalid events response from server.');
}

function normalizePaginatedEventsResponse(response: unknown): PaginatedResponse<Event> {
  const payload = response as any;
  const events = normalizeEventsResponse(response);

  return {
    data: events,
    meta: payload?.meta || payload?.data?.meta,
    links: payload?.links || payload?.data?.links,
  };
}

export const eventsApi = {
  healthCheck() {
    return api.get<{ status: string }>('/health');
  },

  async list(filters: EventFilters = {}) {
    const response = await api.get<unknown>('/events', { params: filters });

    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.log('[eventsApi.list] raw response shape', {
        isArray: Array.isArray(response),
        hasDataArray: Array.isArray((response as any)?.data),
        hasNestedDataArray: Array.isArray((response as any)?.data?.data),
      });
    }

    return normalizePaginatedEventsResponse(response);
  },

  getEvents(filters: EventFilters = {}) {
    return eventsApi.list(filters);
  },

  get(eventId: string) {
    return api.get<Event>(`/events/${eventId}`).then(normalizeEvent);
  },

  getEvent(eventId: string) {
    return eventsApi.get(eventId);
  },

  create(payload: EventPayload) {
    return api.post<Event>('/events', payload).then(normalizeEvent);
  },

  createEvent(payload: EventPayload) {
    return eventsApi.create(payload);
  },

  update(eventId: string, payload: Partial<EventPayload>) {
    return api.put<Event>(`/events/${eventId}`, payload).then(normalizeEvent);
  },

  updateEvent(eventId: string, payload: Partial<EventPayload>) {
    return eventsApi.update(eventId, payload);
  },

  updateCover(eventId: string, payload: FormData) {
    if (!eventId || eventId.includes('{')) {
      throw new Error('Event ID is required before uploading a cover image.');
    }

    const finalBaseUrl = String(apiClient.defaults.baseURL || API_BASE_URL).replace(/\/$/, '');

    if (typeof __DEV__ === 'undefined' || __DEV__) {
      console.log('[eventsApi.uploadCover]', {
        eventId,
        configuredBaseURL: API_BASE_URL,
        activeBaseURL: apiClient.defaults.baseURL,
        url: `${finalBaseUrl}/events/${eventId}/cover`,
        isFormData: typeof FormData !== 'undefined' && payload instanceof FormData,
      });
    }

    return api.post<Event>(`/events/${eventId}/cover`, payload, { timeout: 30000 }).then((event) => {
      const normalized = normalizeEvent(event);
      if (typeof __DEV__ === 'undefined' || __DEV__) {
        console.log('[eventsApi.uploadCover] response', {
          eventId: normalized.uuid || normalized.id,
          coverImage: normalized.coverImage || normalized.cover_image,
        });
      }
      return normalized;
    });
  },

  uploadCover(eventId: string, payload: FormData) {
    return eventsApi.updateCover(eventId, payload);
  },

  delete(eventId: string) {
    return api.delete<Event>(`/events/${eventId}`).then(normalizeEvent);
  },

  deleteEvent(eventId: string) {
    return eventsApi.delete(eventId);
  },

  archive(eventId: string) {
    return api.post<Event>(`/events/${eventId}/archive`).then(normalizeEvent);
  },

  archiveEvent(eventId: string) {
    return eventsApi.archive(eventId);
  },

  restore(eventId: string) {
    return api.post<Event>(`/events/${eventId}/restore`).then(normalizeEvent);
  },

  restoreEvent(eventId: string) {
    return eventsApi.restore(eventId);
  },

  permanentlyDelete(eventId: string) {
    return api.delete<null>(`/events/${eventId}/force`);
  },

  permanentlyDeleteEvent(eventId: string) {
    return eventsApi.permanentlyDelete(eventId);
  },

  duplicate(eventId: string) {
    return api.post<Event>(`/events/${eventId}/duplicate`).then(normalizeEvent);
  },

  duplicateEvent(eventId: string) {
    return eventsApi.duplicate(eventId);
  },

  qr(eventId: string) {
    return api.get<QRCodePayload>(`/events/${eventId}/qr`);
  },

  rsvpPreview(eventId: string) {
    return api.get<Event>(`/events/${eventId}/rsvp/preview`).then(normalizeEvent);
  },

  questions(eventId: string) {
    return api.get<RSVPQuestion[]>(`/events/${eventId}/rsvp/questions`);
  },

  activityLogs(eventId: string) {
    return api.get<unknown>(`/events/${eventId}/activity-logs`).then((response) => {
      if (Array.isArray(response)) return response as ActivityLog[];
      const payload = response as any;
      if (Array.isArray(payload?.data)) return payload.data as ActivityLog[];
      if (Array.isArray(payload?.data?.data)) return payload.data.data as ActivityLog[];
      return [];
    });
  },

  categories() {
    return api.get<EventCategory[]>('/event-categories');
  },

  getCategories() {
    return eventsApi.categories();
  },

  themes() {
    return api.get<Theme[]>('/themes');
  },

  getThemes() {
    return eventsApi.themes();
  },
};
