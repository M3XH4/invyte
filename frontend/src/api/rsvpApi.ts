import { api } from './axios';
import type { Event } from '@/types/event';
import type { EventGuest } from '@/types/guest';
import type { RSVPQuestion, RSVPStats, RSVPSubmissionPayload } from '@/types/rsvp';
import { normalizeEvent } from '@/utils/rsvpStats';

export const rsvpApi = {
  publicEvent(slug: string) {
    return api.get<Event>(`/public/events/${slug}`).then(normalizeEvent);
  },

  submitPublic(slug: string, payload: RSVPSubmissionPayload) {
    return api.post<{ guest: EventGuest; event_stats?: RSVPStats }>(`/public/events/${slug}/rsvp`, payload);
  },

  stats(eventId: string) {
    return api.get<RSVPStats>(`/events/${eventId}/rsvp/stats`);
  },

  questions(eventId: string) {
    return api.get<RSVPQuestion[]>(`/events/${eventId}/rsvp/questions`);
  },

  createQuestion(eventId: string, payload: Partial<RSVPQuestion>) {
    return api.post<RSVPQuestion>(`/events/${eventId}/rsvp/questions`, payload);
  },

  deleteQuestion(eventId: string, questionId: string) {
    return api.delete<null>(`/events/${eventId}/rsvp/questions/${questionId}`);
  },
};
