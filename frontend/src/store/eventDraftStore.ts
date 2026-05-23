import type { EventPayload } from '@/types/event';

type EventDraft = Partial<EventPayload> & {
  response_options?: string[];
  custom_questions?: string[];
  local_cover_uri?: string;
  local_cover_name?: string;
  local_cover_type?: string;
};

let draft: EventDraft = {
  privacy: 'private',
  status: 'published',
  rsvp_enabled: true,
};

export const eventDraftStore = {
  get() {
    return draft;
  },

  merge(patch: EventDraft) {
    draft = { ...draft, ...patch };
    return draft;
  },

  reset() {
    draft = {
      privacy: 'private',
      status: 'published',
      rsvp_enabled: true,
    };
  },
};
