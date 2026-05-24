export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code?: string;
  errors?: Record<string, string[]>;
};

export type PaginationMeta = {
  current_page?: number;
  from?: number | null;
  last_page?: number;
  path?: string;
  per_page?: number;
  to?: number | null;
  total?: number;
};

export type PaginationLinks = {
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta?: PaginationMeta;
  links?: PaginationLinks;
};

export class ApiError extends Error {
  status?: number;
  errors?: Record<string, string[]>;
  code?: string;
  data?: unknown;

  constructor(message: string, status?: number, errors?: Record<string, string[]>, code?: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.code = code;
    this.data = data;
  }
}
