import { apiRequest, apiUpload } from './client';
import type { AuthUser, BaseResponse } from './types';

export function login(loginName: string, password: string, remember = true) {
  return apiRequest<BaseResponse & { token: string }>('/auth/login', {
    method: 'POST',
    body: { login: loginName, password, remember },
  });
}

export function fetchMe(token: string) {
  return apiRequest<BaseResponse & { user: AuthUser }>('/auth/me', { token });
}

export function updateProfile(token: string, formData: FormData) {
  return apiUpload<BaseResponse & { user: AuthUser }>(
    '/auth/profile',
    formData,
    token,
  );
}

export function logout(token: string) {
  return apiRequest<BaseResponse>('/auth/logout', { method: 'DELETE', token });
}
