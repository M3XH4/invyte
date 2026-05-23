export type GuestStatus = 'going' | 'maybe' | 'pending' | 'not_going' | 'not-going';

export type EventGuest = {
  id: string;
  uuid?: string;
  event_id?: string;
  user_id?: string | null;
  name: string;
  email?: string | null;
  phone_number?: string | null;
  contact_method?: string | null;
  contact_value?: string | null;
  role?: string;
  invite_status?: 'pending' | 'sent' | 'opened' | 'expired' | string;
  response_status: GuestStatus;
  status?: GuestStatus;
  plus_ones?: number;
  invited_at?: string | null;
  opened_at?: string | null;
  responded_at?: string | null;
  checked_in_at?: string | null;
  checkedInAt?: string | null;
  attended?: boolean;
  answers?: {
    id?: string;
    question_id?: string;
    guest_id?: string;
    question?: string;
    answer?: unknown;
  }[];
  event?: {
    id?: string;
    uuid?: string;
    title?: string;
    start_date?: string | null;
    start_time?: string | null;
    date?: string | null;
    time?: string | null;
    venue_address?: string | null;
    location?: string | null;
  };
};

export type GuestPayload = {
  name: string;
  email?: string;
  phone_number?: string;
  contact_method?: string;
  contact_value?: string;
  role?: string;
  invite_status?: string;
  response_status?: string;
  plus_ones?: number;
};

export type GuestFilters = {
  search?: string;
  status?: 'all' | 'going' | 'maybe' | 'pending' | 'not_going' | 'not-going';
  page?: number;
  per_page?: number;
};
