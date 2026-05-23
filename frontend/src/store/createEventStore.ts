import { useSyncExternalStore } from 'react';

export type RSVPResponseOption = 'going' | 'maybe' | 'cant_go';

export type CreateEventQuestion = {
  question: string;
  placeholder?: string;
  required: boolean;
  type: 'text' | 'select' | 'number';
};

export type CreateEventDraft = {
  categoryId?: string;
  categorySlug?: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  venueAddress: string;
  latitude?: number;
  longitude?: number;
  dressCode?: string;
  foodOption?: string;
  rsvpEnabled: boolean;
  rsvpDeadlineDate?: string;
  rsvpDeadlineTime?: string;
  maxGuests?: number;
  allowPlusOnes: boolean;
  maxCompanions?: number;
  allowExtraGuests: boolean;
  requireApproval: boolean;
  responseOptions: RSVPResponseOption[];
  customQuestions: CreateEventQuestion[];
  themeId?: string;
  themeSlug?: string;
  coverImage?: string;
  localCoverName?: string;
  localCoverType?: string;
};

const defaultDraft: CreateEventDraft = {
  title: '',
  description: '',
  startDate: '',
  startTime: '',
  venueAddress: '',
  rsvpEnabled: true,
  allowPlusOnes: true,
  allowExtraGuests: false,
  requireApproval: false,
  responseOptions: ['going', 'maybe', 'cant_go'],
  customQuestions: [],
};

let draft: CreateEventDraft = { ...defaultDraft };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return draft;
}

export const createEventStore = {
  subscribe,
  getSnapshot,

  get() {
    return draft;
  },

  merge(patch: Partial<CreateEventDraft>) {
    draft = { ...draft, ...patch };
    emit();
  },

  reset(patch: Partial<CreateEventDraft> = {}) {
    draft = { ...defaultDraft, ...patch };
    emit();
  },
};

export function useCreateEventStore() {
  return useSyncExternalStore(
    createEventStore.subscribe,
    createEventStore.getSnapshot,
    createEventStore.getSnapshot,
  );
}
