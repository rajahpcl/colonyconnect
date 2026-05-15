import { useAuthStore } from '../auth/authStore';

/**
 * API base path points to the backend context-path.
 * In dev, Vite's proxy forwards /colonyconnectapi → http://localhost:8080.
 * In production, the reverse-proxy (Nginx/Apache) routes this to Tomcat.
 */
const API_BASE = '/colonyconnectapi';

type ApiRequestOptions = {
  withCsrf?: boolean;
};

function isJsonResponse(response: Response) {
  return response.headers.get('content-type')?.includes('application/json') ?? false;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  _options?: ApiRequestOptions
) {
  const headers = new Headers(init?.headers);
  headers.set('Accept', 'application/json');

  if (init?.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // JWT is automatically sent via HTTP-only cookie – no manual header needed

  const fullPath = path.startsWith(API_BASE) ? path : `${API_BASE}${path}`;
  const response = await fetch(fullPath, {
    ...init,
    credentials: 'include', // Required to send/receive HTTP-only cookies
    headers,
  });

  if (response.status === 401) {
    useAuthStore.getState().clearSession();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = isJsonResponse(response)
    ? ((await response.json()) as T | { message?: string })
    : null;

  if (!response.ok) {
    throw new Error((payload as { message?: string } | null)?.message ?? `Request failed with status ${response.status}`);
  }

  return payload as T;
}

export function toQueryString(params: Record<string, string | number | undefined | null>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}`.trim() !== '') {
      searchParams.set(key, `${value}`);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}
