import type { Event, EventRsvpCounts } from '@/types/event';
import type { EventGuest, GuestStatus } from '@/types/guest';

export type NormalizedEventStats = EventRsvpCounts & {
  totalInvited: number;
  total_invited: number;
  responseRate: number;
  response_rate: number;
};

export function normalizeGuestStatus(status?: string | null): 'going' | 'maybe' | 'not_going' | 'pending' {
  if (status === 'not-going' || status === 'cant_go' || status === 'cant-go') return 'not_going';
  if (status === 'going' || status === 'maybe' || status === 'pending') return status;
  return 'pending';
}

export function displayGuestStatus(status?: GuestStatus | string | null) {
  const normalized = normalizeGuestStatus(status);
  if (normalized === 'not_going') return "Can't Go";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function normalizeEventRsvpStats(input?: Partial<Event['rsvp']> & {
  totalInvited?: number;
  total_invited?: number;
  responseRate?: number;
  response_rate?: number;
}): NormalizedEventStats {
  const going = Number(input?.going ?? 0);
  const maybe = Number(input?.maybe ?? 0);
  const notGoing = Number(input?.notGoing ?? input?.not_going ?? 0);
  const pending = Number(input?.pending ?? 0);
  const totalInvited = Number(input?.totalInvited ?? input?.total_invited ?? going + maybe + notGoing + pending);
  const responseRate = totalInvited > 0 ? Math.round(((going + maybe + notGoing) / totalInvited) * 100) : 0;

  return {
    going,
    maybe,
    notGoing,
    not_going: notGoing,
    pending,
    totalInvited,
    total_invited: totalInvited,
    responseRate: Number(input?.responseRate ?? input?.response_rate ?? responseRate),
    response_rate: Number(input?.responseRate ?? input?.response_rate ?? responseRate),
  };
}

export function deriveEventStatsFromGuests(guests: EventGuest[]) {
  const counts = (Array.isArray(guests) ? guests : []).reduce(
    (acc, guest) => {
      const status = normalizeGuestStatus(guest.response_status || guest.status);
      if (status === 'going') acc.going += 1;
      else if (status === 'maybe') acc.maybe += 1;
      else if (status === 'not_going') acc.notGoing += 1;
      else acc.pending += 1;
      return acc;
    },
    { going: 0, maybe: 0, notGoing: 0, pending: 0 },
  );

  return normalizeEventRsvpStats({
    ...counts,
    totalInvited: Array.isArray(guests) ? guests.length : 0,
  });
}

export function normalizeEvent(event: Event): Event {
  const stats = normalizeEventRsvpStats({
    ...(event.rsvp || {}),
    totalInvited: event.totalInvited,
    total_invited: event.total_invited,
    responseRate: event.responseRate,
    response_rate: event.response_rate,
  });

  return {
    ...event,
    rsvp: {
      going: stats.going,
      maybe: stats.maybe,
      notGoing: stats.notGoing,
      not_going: stats.notGoing,
      pending: stats.pending,
    },
    totalInvited: stats.totalInvited,
    total_invited: stats.totalInvited,
    responseRate: stats.responseRate,
    response_rate: stats.responseRate,
  };
}
