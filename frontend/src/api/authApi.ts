import { api } from './axios';
import type { AuthPayload, LoginPayload, RegisterPayload, User } from '@/types/auth';

export const authApi = {
  login(payload: LoginPayload) {
    return api.post<AuthPayload>('/auth/login', payload);
  },

  register(payload: RegisterPayload) {
    return api.post<AuthPayload>('/auth/register', payload);
  },

  guest(deviceName = 'expo-guest') {
    return api.post<AuthPayload>('/auth/guest', { device_name: deviceName });
  },

  logout(payload?: { logout_all?: boolean; forget_remember?: boolean }) {
    return api.post<null>('/auth/logout', payload ?? {});
  },

  remember(rememberToken: string) {
    return api.post<AuthPayload>('/auth/remember', { remember_token: rememberToken });
  },

  forgotPassword(email: string) {
    return api.post<unknown>('/auth/forgot-password', { email });
  },

  verifyCode(email: string, code: string) {
    return api.post<unknown>('/auth/verify-code', { email, code });
  },

  resetPassword(email: string, code: string, password: string) {
    return api.post<unknown>('/auth/reset-password', {
      email,
      code,
      password,
      password_confirmation: password,
    });
  },

  me() {
    return api.get<User>('/me');
  },
};
