import { api } from './axios';
import type { Event } from '@/types/event';
import type { EventGuest } from '@/types/guest';
import type { RSVPStats, RSVPSubmissionPayload } from '@/types/rsvp';
import { normalizeEvent } from '@/utils/rsvpStats';

export type PublicRsvpSubmitResponse = {
  guest: EventGuest;
  event_stats?: RSVPStats;
};

export const publicRsvpApi = {
  getEvent(slug: string) {
    return api.get<Event>(`/public/events/${slug}`).then(normalizeEvent);
  },

  submit(slug: string, payload: RSVPSubmissionPayload) {
    return api.post<PublicRsvpSubmitResponse>(`/public/events/${slug}/rsvp`, payload);
  },
};
