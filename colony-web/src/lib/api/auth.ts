import type { SessionUser } from '../auth/types';
import { apiRequest } from './client';

type LoginRequest = {
  empNo: string;
  password: string;
};

/* ---- Test credentials for offline/no-DB UI testing ---- */
const TEST_CREDENTIALS = {
  empNo: 'testadmin',
  password: 'admin123',
};

const TEST_USER: SessionUser = {
  empNo: 'testadmin',
  name: 'Test Admin',
  role: 'SYSTEM_ADMIN',
  roles: ['SYSTEM_ADMIN', 'ADMIN', 'COMPLEX_ADMIN', 'RESIDENT'],
  complexCode: 'TEST_COMPLEX',
  vehicleRegistered: true,
  redirectUrl: '/app/home',
};

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) return true;
  if (error instanceof Error && (
    error.message.includes('NetworkError') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('Network request failed') ||
    error.message.includes('ERR_CONNECTION_REFUSED')
  )) return true;
  return false;
}

/**
 * Attempts real API login first. If the backend is unreachable and the
 * credentials match the test account, returns a mock admin session so
 * the full UI can be explored without a running database.
 */
export async function login(request: LoginRequest): Promise<SessionUser> {
  try {
    return await apiRequest<SessionUser>(
      '/api/v1/auth/login',
      {
        body: JSON.stringify(request),
        method: 'POST',
      },
      { withCsrf: false }
    );
  } catch (error) {
    const isProxyError = error instanceof Error && (error.message.includes('502') || error.message.includes('503') || error.message.includes('504'));
    
    if (
      (isNetworkError(error) || isProxyError || (error instanceof Error && error.message.includes('Failed to fetch'))) &&
      request.empNo === TEST_CREDENTIALS.empNo &&
      request.password === TEST_CREDENTIALS.password
    ) {
      // Simulate small delay for realistic UX
      await new Promise((resolve) => setTimeout(resolve, 600));
      return { ...TEST_USER };
    }
    throw error;
  }
}

export async function securityLogin(pin: string) {
  try {
    return await apiRequest<SessionUser>(
      '/api/v1/auth/security-login',
      {
        body: JSON.stringify({ pin }),
        method: 'POST',
      },
      { withCsrf: false }
    );
  } catch (error) {
    const isProxyError = error instanceof Error && (error.message.includes('502') || error.message.includes('503') || error.message.includes('504'));
    if ((isNetworkError(error) || isProxyError || (error instanceof Error && error.message.includes('Failed to fetch'))) && pin === '1234') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return {
        empNo: 'SECURITY',
        name: 'Security Guard',
        role: 'SECURITY',
        roles: ['SECURITY'],
        complexCode: null,
        vehicleRegistered: false,
        redirectUrl: '/app/security/home',
      } satisfies SessionUser;
    }
    throw error;
  }
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
