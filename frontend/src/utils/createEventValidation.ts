import type { ApiError } from '@/types/api';
import type { EventPayload } from '@/types/event';
import type { CreateEventDraft } from '@/store/createEventStore';
import {
  combineDateAndTime,
  combineDateTimeForApi,
  isBeforeDateTime,
  isFutureDateTime,
  normalizeTime,
} from '@/utils/dateTime';

export type CreateEventStep = 'category' | 'details' | 'rsvp' | 'theme' | 'final';
export type ValidationErrors = Record<string, string>;

export { combineDateAndTime, isFutureDateTime, normalizeTime };

export function isBeforeEventStart(
  deadlineDate?: string,
  deadlineTime?: string,
  eventDate?: string,
  eventTime?: string,
) {
  return isBeforeDateTime(deadlineDate, deadlineTime, eventDate, eventTime);
}

export function formatBackendDateTime(date?: string, time?: string) {
  return combineDateTimeForApi(date, time);
}

function isPositive(value?: number) {
  return value === undefined || (Number.isFinite(value) && value > 0);
}

export function validateCreateEventStep(step: CreateEventStep, draft: CreateEventDraft) {
  const errors: ValidationErrors = {};

  if (step === 'category' || step === 'final') {
    if (!draft.categoryId && !draft.categorySlug) {
      errors.category = 'Choose an event category.';
    }
  }

  if (step === 'details' || step === 'final') {
    if (!draft.title.trim()) errors.title = 'Event title is required.';
    if (!draft.startDate) errors.start_date = 'Start date is required.';
    if (!draft.startTime) errors.start_time = 'Start time is required.';
    if (!draft.venueAddress.trim()) {
      errors.venue_address = 'Add a venue address.';
    }

    if (draft.startDate && draft.startTime && !isFutureDateTime(draft.startDate, draft.startTime)) {
      errors.start_time = 'Event start must be after the current time.';
    }

    if (draft.endDate || draft.endTime) {
      const start = combineDateAndTime(draft.startDate, draft.startTime);
      const end = combineDateAndTime(draft.endDate || draft.startDate, draft.endTime);
      if (!end || !start || end.getTime() <= start.getTime()) {
        errors.end_time = 'End date and time must be after the start.';
      }
    }
  }

  if (step === 'rsvp' || step === 'final') {
    if (draft.rsvpEnabled) {
      if (draft.responseOptions.length === 0) {
        errors.response_options = 'Select at least one RSVP response option.';
      }
      if (!draft.rsvpDeadlineDate) errors.rsvp_deadline = 'RSVP deadline date is required.';
      if (!draft.rsvpDeadlineTime) errors.rsvp_deadline_time = 'RSVP deadline time is required.';
      if (
        draft.rsvpDeadlineDate &&
        draft.rsvpDeadlineTime &&
        !isFutureDateTime(draft.rsvpDeadlineDate, draft.rsvpDeadlineTime)
      ) {
        errors.rsvp_deadline = 'RSVP deadline must be after the current time.';
      }
      if (
        draft.rsvpDeadlineDate &&
        draft.rsvpDeadlineTime &&
        !isBeforeEventStart(
          draft.rsvpDeadlineDate,
          draft.rsvpDeadlineTime,
          draft.startDate,
          draft.startTime,
        )
      ) {
        errors.rsvp_deadline = 'RSVP deadline must be before the event starts.';
      }
    }

    if (!isPositive(draft.maxGuests)) errors.max_guests = 'Maximum guests must be positive.';
    if (draft.allowPlusOnes && !isPositive(draft.maxCompanions)) {
      errors.max_companions = 'Max companions must be positive.';
    }
  }

  if (step === 'theme' || step === 'final') {
    if (!draft.themeId && !draft.themeSlug) {
      errors.theme_id = 'Choose an invitation theme.';
    }
  }

  return errors;
}

export function validateCreateEventDraft(draft: CreateEventDraft) {
  return validateCreateEventStep('final', draft);
}

function questionTypeToBackend(type: CreateEventDraft['customQuestions'][number]['type']) {
  if (type === 'select') return 'single_choice';
  if (type === 'number') return 'text';
  return 'text';
}

export function mapCreateEventDraftToPayload(draft: CreateEventDraft): EventPayload {
  return stripUndefined({
    category_id: draft.categoryId || undefined,
    category_slug: draft.categorySlug || undefined,
    theme_id: draft.themeId || undefined,
    theme_slug: draft.themeSlug || undefined,
    title: draft.title.trim(),
    description: draft.description.trim() || undefined,
    start_date: draft.startDate,
    start_time: normalizeTime(draft.startTime) || undefined,
    end_date: draft.endDate || undefined,
    end_time: normalizeTime(draft.endTime) || undefined,
    venue_address: draft.venueAddress.trim() || undefined,
    latitude: draft.latitude,
    longitude: draft.longitude,
    dress_code: draft.dressCode || undefined,
    food_option: draft.foodOption || undefined,
    privacy: 'private',
    status: 'published',
    rsvp_enabled: draft.rsvpEnabled,
    rsvp_deadline: draft.rsvpEnabled
      ? formatBackendDateTime(draft.rsvpDeadlineDate, draft.rsvpDeadlineTime)
      : undefined,
    max_guests: draft.maxGuests,
    allow_plus_ones: draft.allowPlusOnes,
    allow_guest_invites: draft.allowExtraGuests,
    show_guest_list: true,
    questions: draft.customQuestions.map((question) => ({
      question: question.question,
      question_type: questionTypeToBackend(question.type),
      required: question.required,
    })),
  }) as EventPayload;
}

function stripUndefined(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== ''),
  );
}

export function parseApiValidationErrors(error: unknown): ValidationErrors {
  const apiError = error as ApiError & { errors?: Record<string, string[] | string> };
  const errors = apiError?.errors || {};

  return Object.entries(errors).reduce<ValidationErrors>((acc, [field, messages]) => {
    acc[field] = Array.isArray(messages) ? messages.join('\n') : String(messages);
    return acc;
  }, {});
}
