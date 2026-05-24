import { api } from './axios';
import type { Event } from '@/types/event';
import type { EventGuest } from '@/types/guest';
import type { RSVPStats, RSVPSubmissionPayload } from '@/types/rsvp';
import { normalizeEvent } from '@/utils/rsvpStats';

export type GuestEvent = {
  event: Event;
  guest: unknown;
  permissions: {
    role?: 'guest' | 'host' | 'admin' | 'public';
    can_view_details: boolean;
    can_view_guest_list: boolean;
    can_edit_event: boolean;
    can_open_settings?: boolean;
    can_add_guest: boolean;
    can_remove_guest?: boolean;
    can_archive_event?: boolean;
    can_delete_event: boolean;
    can_restore_event?: boolean;
    can_manage_attendance: boolean;
    can_view_own_rsvp?: boolean;
    can_update_own_rsvp?: boolean;
    can_view_guest_answers?: boolean;
  };
};

export type OwnRsvpResponse = {
  guest: EventGuest;
  event_stats?: Partial<RSVPStats>;
  permissions?: GuestEvent['permissions'];
};

export const guestEventsApi = {
  async list() {
    const response = await api.get<unknown>('/guest/events');
    const items = Array.isArray(response) ? response : Array.isArray((response as any)?.data) ? (response as any).data : [];
    return items.map((item: any) => ({
      ...item,
      event: normalizeEvent(item.event || item),
    })) as GuestEvent[];
  },

  myRsvp(eventId: string) {
    return api.get<OwnRsvpResponse>(`/events/${eventId}/my-rsvp`);
  },

  updateMyRsvp(eventId: string, payload: Pick<RSVPSubmissionPayload, 'response_status' | 'plus_ones' | 'answers'>) {
    return api.put<OwnRsvpResponse>(`/events/${eventId}/my-rsvp`, payload);
  },
};
