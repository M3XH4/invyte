import { api } from './axios';
import type { Event } from '@/types/event';
import type { EventGuest } from '@/types/guest';
import type { RSVPStats, RSVPSubmissionPayload } from '@/types/rsvp';
import { normalizeEvent } from '@/utils/rsvpStats';

export type PublicRsvpSubmitResponse = {
  guest: EventGuest;
  event_stats?: RSVPStats;
  event?: Event;
};

export type MyRsvpResponse = {
  already_responded: boolean;
  event: Event;
  guest?: EventGuest | null;
};

export const publicRsvpApi = {
  getEvent(slug: string) {
    return api.get<Event>(`/public/events/${slug}`).then(normalizeEvent);
  },

  submit(slug: string, payload: RSVPSubmissionPayload) {
    return api.post<PublicRsvpSubmitResponse>(`/public/events/${slug}/rsvp`, payload);
  },

  async myRsvp(slug: string, email?: string) {
    const response = await api.get<MyRsvpResponse>(`/public/events/${slug}/my-rsvp`, {
      params: email ? { email } : undefined,
    });
    return {
      ...response,
      event: normalizeEvent(response.event),
    };
  },
};
