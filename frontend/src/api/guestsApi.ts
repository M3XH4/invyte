import { api } from './axios';
import type { PaginatedResponse } from '@/types/api';
import type { ActivityLog } from '@/types/event';
import type { EventGuest, GuestFilters, GuestPayload } from '@/types/guest';
import type { NormalizedEventStats } from '@/utils/rsvpStats';

export type GuestMutationResponse = EventGuest | {
  guest?: EventGuest;
  event_stats?: Partial<NormalizedEventStats>;
  activity_log?: ActivityLog;
};

export type GuestDetailsResponse = {
  guest: EventGuest;
};

export function normalizeGuestsResponse(response: unknown): EventGuest[] {
  if (Array.isArray(response)) return response as EventGuest[];
  const payload = response as any;
  if (Array.isArray(payload?.data)) return payload.data as EventGuest[];
  if (Array.isArray(payload?.data?.data)) return payload.data.data as EventGuest[];
  if (Array.isArray(payload?.guests)) return payload.guests as EventGuest[];
  if (Array.isArray(payload?.data?.guests)) return payload.data.guests as EventGuest[];
  throw new Error('Invalid guests response from server.');
}

export const guestsApi = {
  async list(eventId: string, filters: GuestFilters = {}) {
    const normalized = {
      ...filters,
      status: filters.status === 'not-going' ? 'not_going' : filters.status,
    };

    const response = await api.get<unknown>(`/events/${eventId}/guests`, {
      params: normalized,
    });

    return {
      data: normalizeGuestsResponse(response),
      meta: (response as any)?.meta || (response as any)?.data?.meta,
      links: (response as any)?.links || (response as any)?.data?.links,
    } as PaginatedResponse<EventGuest>;
  },

  getGuests(eventId: string, filters: GuestFilters = {}) {
    return guestsApi.list(eventId, filters);
  },

  detail(eventId: string, guestId: string) {
    return api.get<GuestDetailsResponse>(`/events/${eventId}/guests/${guestId}`);
  },

  getGuestDetails(eventId: string, guestId: string) {
    return guestsApi.detail(eventId, guestId);
  },

  create(eventId: string, payload: GuestPayload) {
    return api.post<GuestMutationResponse>(`/events/${eventId}/guests`, payload);
  },

  createGuest(eventId: string, payload: GuestPayload) {
    return guestsApi.create(eventId, payload);
  },

  update(eventId: string, guestId: string, payload: Partial<GuestPayload>) {
    return api.put<GuestMutationResponse>(`/events/${eventId}/guests/${guestId}`, payload);
  },

  updateGuest(eventId: string, guestId: string, payload: Partial<GuestPayload>) {
    return guestsApi.update(eventId, guestId, payload);
  },

  delete(eventId: string, guestId: string) {
    return api.delete<{ event_stats?: Partial<NormalizedEventStats>; activity_log?: ActivityLog }>(
      `/events/${eventId}/guests/${guestId}`,
    );
  },

  deleteGuest(eventId: string, guestId: string) {
    return guestsApi.delete(eventId, guestId);
  },

  updateAttendance(eventId: string, guestId: string, checkedIn: boolean) {
    return api.patch<GuestMutationResponse>(`/events/${eventId}/guests/${guestId}/attendance`, {
      checked_in: checkedIn,
    });
  },
};
