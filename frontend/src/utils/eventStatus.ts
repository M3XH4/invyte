import type { Event } from '@/types/event';

export type ComputedEventStatus = 'upcoming' | 'ongoing' | 'past' | 'archived';

function parseEventDateTime(date?: string | null, time?: string | null, fallbackTime = '00:00:00') {
  if (!date) return null;
  const cleanTime = String(time || fallbackTime).slice(0, 8);
  const normalizedTime = cleanTime.length === 5 ? `${cleanTime}:00` : cleanTime;
  const value = new Date(`${date}T${normalizedTime}`);
  return Number.isNaN(value.getTime()) ? null : value;
}

export function getEventComputedStatus(event: Event, now = new Date()): ComputedEventStatus {
  if (event.archived_at || event.is_archived || event.status === 'archived') return 'archived';

  const start = parseEventDateTime(event.start_date || event.date, event.start_time || event.time, '00:00:00');
  if (!start) return event.status === 'past' ? 'past' : 'upcoming';

  const endDate = event.end_date || event.start_date || event.date;
  const end = parseEventDateTime(endDate, event.end_time, event.end_date ? '23:59:59' : '23:59:59') || start;

  if (now.getTime() < start.getTime()) return 'upcoming';
  if (now.getTime() <= end.getTime()) return 'ongoing';
  return 'past';
}

export function isEventRsvpOpen(event: Event, now = new Date()) {
  const status = getEventComputedStatus(event, now);
  if (status === 'archived' || status === 'past') return false;
  if (event.rsvp_enabled === false) return false;
  if (!event.rsvp_deadline) return true;

  const deadline = new Date(event.rsvp_deadline);
  if (Number.isNaN(deadline.getTime())) return true;
  return deadline.getTime() >= now.getTime();
}
