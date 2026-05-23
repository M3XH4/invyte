import type { EventGuest } from './guest';
import type { RSVPQuestion } from './rsvp';

export type EventCategory = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
};

export type Theme = {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string | null;
  config?: Record<string, unknown>;
};

export type QRCodePayload = {
  id?: string;
  code: string;
  url: string;
  public_url?: string;
  qr_value?: string;
  payload?: {
    type?: string;
    slug?: string;
    url?: string;
  };
  scan_count?: number;
};

export type EventRsvpCounts = {
  going: number;
  maybe: number;
  not_going?: number;
  notGoing: number;
  pending: number;
};

export type Event = {
  id: string;
  uuid?: string;
  user_id?: string;
  created_by?: string;
  slug: string;
  title: string;
  description?: string | null;
  cover_image?: string | null;
  coverImage?: string | null;
  start_date?: string | null;
  date?: string | null;
  start_time?: string | null;
  time?: string | null;
  end_date?: string | null;
  end_time?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  location?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  privacy?: string;
  status: 'upcoming' | 'ongoing' | 'past' | 'archived' | string;
  publication_status?: string;
  timeline_status?: string;
  dress_code?: string | null;
  food_option?: string | null;
  max_guests?: number | null;
  rsvp_enabled?: boolean;
  allow_plus_ones?: boolean;
  allow_guest_invites?: boolean;
  show_guest_list?: boolean;
  rsvp_deadline?: string | null;
  archived_at?: string | null;
  is_archived?: boolean;
  category?: EventCategory | string | null;
  category_slug?: string | null;
  category_name?: string | null;
  theme?: Theme | string | null;
  qr?: QRCodePayload | null;
  public_url?: string | null;
  qr_value?: string | null;
  guests?: EventGuest[];
  questions?: RSVPQuestion[];
  rsvp: EventRsvpCounts;
  total_invited?: number;
  totalInvited: number;
  responseRate?: number;
  response_rate?: number;
  created_at?: string;
  updated_at?: string;
};

export type EventFilters = {
  search?: string;
  status?: 'all' | 'upcoming' | 'ongoing' | 'past' | 'archived';
  category?: string;
  sort?: string;
  page?: number;
  per_page?: number;
};

export type EventPayload = {
  category_id?: string;
  category_slug?: string;
  theme_id?: string;
  theme_slug?: string;
  title: string;
  description?: string;
  cover_image?: string;
  start_date: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  venue_name?: string;
  venue_address?: string;
  latitude?: number;
  longitude?: number;
  privacy?: string;
  status?: string;
  dress_code?: string;
  food_option?: string;
  max_guests?: number;
  rsvp_enabled?: boolean;
  allow_plus_ones?: boolean;
  allow_guest_invites?: boolean;
  show_guest_list?: boolean;
  rsvp_deadline?: string;
  questions?: {
    question: string;
    question_type?: string;
    required?: boolean;
    options?: string[];
  }[];
};

export type ActivityLog = {
  id: string;
  event_id?: string;
  user_id?: string | null;
  action: string;
  type?: string;
  description?: string | null;
  metadata?: Record<string, unknown>;
  timestamp?: string;
  created_at?: string;
  updated_at?: string;
};
