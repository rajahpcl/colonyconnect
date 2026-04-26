import { useAuthStore } from '../auth/authStore';

type ApiRequestOptions = {
  withCsrf?: boolean;
};

function isJsonResponse(response: Response) {
  return response.headers.get('content-type')?.includes('application/json') ?? false;
}

export async function ensureCsrfToken() {
  const existingToken = useAuthStore.getState().csrfToken;
  if (existingToken) {
    return existingToken;
  }

  const response = await fetch('/api/v1/auth/csrf', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to initialize CSRF token');
  }

  const payload = (await response.json()) as { token: string };
  useAuthStore.getState().setCsrfToken(payload.token);
  return payload.token;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  options?: ApiRequestOptions
) {
  const headers = new Headers(init?.headers);
  headers.set('Accept', 'application/json');

  if (init?.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options?.withCsrf) {
    const csrfToken = await ensureCsrfToken();
    headers.set('X-XSRF-TOKEN', csrfToken);
  }

  const response = await fetch(path, {
    ...init,
    credentials: 'include',
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
