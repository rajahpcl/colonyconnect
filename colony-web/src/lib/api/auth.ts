import type { SessionUser } from '../auth/types';
import { apiRequest } from './client';

type LoginRequest = {
  empNo: string;
  password: string;
};

export async function login(request: LoginRequest) {
  return apiRequest<SessionUser>(
    '/api/v1/auth/login',
    {
      body: JSON.stringify(request),
      method: 'POST',
    },
    { withCsrf: false }
  );
}

export async function securityLogin(pin: string) {
  return apiRequest<SessionUser>(
    '/api/v1/auth/security-login',
    {
      body: JSON.stringify({ pin }),
      method: 'POST',
    },
    { withCsrf: false }
  );
}

export async function fetchCurrentUser() {
  return apiRequest<SessionUser>('/api/v1/auth/me');
}

export async function logout() {
  return apiRequest<{ message: string }>(
    '/api/v1/auth/logout',
    {
      method: 'POST',
    },
    { withCsrf: true }
  );
}
