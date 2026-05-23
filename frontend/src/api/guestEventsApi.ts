import { api } from './axios';
import type { Event } from '@/types/event';
import { normalizeEvent } from '@/utils/rsvpStats';

export type GuestEvent = {
  event: Event;
  guest: unknown;
  permissions: {
    can_view_details: boolean;
    can_view_guest_list: boolean;
    can_edit_event: boolean;
    can_add_guest: boolean;
    can_delete_event: boolean;
    can_manage_attendance: boolean;
  };
};

export const guestEventsApi = {
  async list() {
    const response = await api.get<unknown>('/guest/events');
    const items = Array.isArray(response) ? response : Array.isArray((response as any)?.data) ? (response as any).data : [];
    return items.map((item: any) => ({
      ...item,
      event: normalizeEvent(item.event),
    })) as GuestEvent[];
  },
};
