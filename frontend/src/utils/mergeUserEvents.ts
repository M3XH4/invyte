import type { GuestEvent } from '@/api/guestEventsApi';
import type { Event } from '@/types/event';

export type UserEventRelationship = Event & {
  relationshipRole: 'host' | 'guest';
};

function eventIdentity(event: Event) {
  return String(event.uuid || event.id || event.slug);
}

export function mergeUserEvents(hostedEvents: Event[] = [], guestEvents: GuestEvent[] = []) {
  const merged = new Map<string, UserEventRelationship>();

  hostedEvents.forEach((event) => {
    const eventRole = event.permissions?.role === 'guest' ? 'guest' : 'host';

    merged.set(
      eventIdentity(event),
      eventRole === 'guest'
        ? {
            ...event,
            permissions: {
              ...(event.permissions || {}),
              role: 'guest',
              can_view_details: true,
              can_view_guest_list: !!event.permissions?.can_view_guest_list,
              can_edit_event: false,
              can_open_settings: false,
              can_add_guest: false,
              can_remove_guest: false,
              can_archive_event: false,
              can_delete_event: false,
              can_restore_event: false,
              can_manage_attendance: false,
              can_view_own_rsvp: true,
              can_update_own_rsvp: !!event.permissions?.can_update_own_rsvp,
              can_view_guest_answers: false,
            },
            relationshipRole: 'guest',
          }
        : {
            ...event,
            permissions: {
              ...(event.permissions || {}),
              role: 'host',
              can_view_details: true,
              can_view_guest_list: true,
              can_edit_event: true,
              can_open_settings: true,
              can_add_guest: true,
              can_remove_guest: true,
              can_archive_event: true,
              can_delete_event: true,
              can_restore_event: true,
              can_manage_attendance: true,
              can_view_own_rsvp: false,
              can_update_own_rsvp: false,
              can_view_guest_answers: true,
            },
            relationshipRole: 'host',
          },
    );
  });

  guestEvents.forEach((item) => {
    const event = item.event;
    const key = eventIdentity(event);

    if (merged.has(key)) return;

    merged.set(key, {
      ...event,
      guest: item.guest as Event['guest'],
      permissions: {
        ...(item.permissions || {}),
        role: 'guest',
        can_view_details: true,
        can_view_guest_list: !!item.permissions?.can_view_guest_list,
        can_edit_event: false,
        can_open_settings: false,
        can_add_guest: false,
        can_remove_guest: false,
        can_archive_event: false,
        can_delete_event: false,
        can_restore_event: false,
        can_manage_attendance: false,
        can_view_own_rsvp: true,
        can_update_own_rsvp: !!item.permissions?.can_update_own_rsvp,
        can_view_guest_answers: false,
      },
      relationshipRole: 'guest',
    });
  });

  return Array.from(merged.values());
}
