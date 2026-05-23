export type User = {
  id: string;
  name: string;
  username?: string | null;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  phone_number?: string | null;
  role?: 'host' | 'guest' | 'admin' | string;
  is_guest?: boolean;
  has_seen_getting_started?: boolean;
  has_seen_onboarding?: boolean;
  email_verified_at?: string | null;
  created_at?: string;
};

export type AuthPayload = {
  user: User;
  token?: string;
  access_token?: string;
  remember_token?: string | null;
  expires_at?: string | null;
  token_type: 'Bearer' | string;
};

export type LoginPayload = {
  email: string;
  password: string;
  remember_me?: boolean;
  device_name?: string;
};

export type RegisterPayload = {
  name: string;
  username?: string;
  email: string;
  phone_number?: string;
  password: string;
  password_confirmation: string;
  device_name?: string;
};
