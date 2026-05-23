export type RSVPQuestion = {
  id: string;
  event_id?: string;
  question: string;
  question_type?: 'text' | 'textarea' | 'single_choice' | 'multi_choice' | 'yes_no' | string;
  required?: boolean;
  options?: string[];
  sort_order?: number;
  placeholder?: string;
};

export type RSVPAnswer = {
  id?: string;
  question_id: string;
  guest_id?: string;
  answer: unknown;
};

export type RSVPSubmissionPayload = {
  guest_id?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  response_status: 'going' | 'maybe' | 'not_going';
  plus_ones?: number;
  answers?: {
    question_id: string;
    answer: unknown;
  }[];
};

export type RSVPStats = {
  total: number;
  going: number;
  maybe: number;
  not_going: number;
  pending: number;
  checked_in: number;
  conversion_rate?: number;
};
