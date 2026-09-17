import axios, { AxiosError, type GenericAbortSignal } from 'axios';

export interface ApiUser {

  id: string;
  login: string;
  role: string;
  currency: string | null;
  onboarded: boolean;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSession {
  accessToken: string;
  refreshToken: string;

  expiresIn: number;
  user: ApiUser;
}

export interface StoredSession extends ApiSession {
  expiresAt: number;
}

export interface ApiRequestConfig {

  signal?: AbortSignal;
}

const STORAGE_KEY = '***';

export class ApiError extends Error {
  status: number;

  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function getStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as StoredSession;
    if (typeof parsed.user?.login !== 'string') {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function storeSession(session: ApiSession): StoredSession {
  const stored: StoredSession = {
    ...session,
    expiresAt: Date.now() + session.expiresIn * 1000,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  emitSessionChange();
  return stored;
}

export function clearStoredSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  emitSessionChange();
}

type SessionListener = () => void;
const listeners = new Set<SessionListener>();

export function subscribeSessionChange(cb: SessionListener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function emitSessionChange(): void {
  listeners.forEach((cb) => cb());
}

let refreshPromise: Promise<boolean> | null = null;

export async function refreshSessionOnce(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const stored = getStoredSession();
    if (!stored?.refreshToken) return false;
    try {
      const next = await rawRequest<ApiSession>('POST', '/auth/refresh', {
        body: { refreshToken: stored.refreshToken },
        auth: false,
      });
      storeSession(next);
      return true;
    } catch {
      clearStoredSession();
      return false;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

function cancelReason(signal: GenericAbortSignal | undefined, fallback: unknown): unknown {
  const aborted = signal as AbortSignal | undefined;
  if (aborted && typeof aborted === 'object' && aborted.aborted) return aborted.reason ?? fallback;
  return fallback;
}

const http = axios.create({
  baseURL: '/api/v1',
});

http.interceptors.response.use((response) => {
  if (response.status === 204) return null as never;
  const envelope = response.data as { data?: unknown } | null | undefined;
  return (envelope?.data ?? null) as never;
});

http.interceptors.response.use(undefined, (error: unknown) => {
  if (error instanceof AxiosError) {
    if (axios.isCancel(error)) {
      return Promise.reject(cancelReason(error.config?.signal, error));
    }
    if (error.response) {
      const envelope = (
        error.response.data as { error?: { message?: string; code?: string } } | undefined
      )?.error;
      const apiError = new ApiError(
        envelope?.message ?? `Ошибка запроса (${error.response.status})`,
        error.response.status,
        envelope?.code,
      );

      if (envelope?.code === 'CONSENT_REQUIRED') {
        window.dispatchEvent(new Event('consent-required'));
      }
      return Promise.reject(apiError);
    }
    return Promise.reject(new ApiError('Нет связи с сервером', 0));
  }
  return Promise.reject(error);
});

interface RequestOpts {
  body?: unknown;

  auth?: boolean;

  retry?: boolean;
  signal?: AbortSignal;
}

async function rawRequest<T>(
  method: string,
  path: string,
  { body, auth = true, signal }: RequestOpts = {},
): Promise<T> {
  const stored = auth ? getStoredSession() : null;
  const headers: Record<string, string> = {};
  if (auth && stored?.accessToken) headers['Authorization'] = `Bearer ${stored.accessToken}`;

  const data = await http.request({ method, url: path, data: body, headers, signal });
  return data as unknown as T;
}

async function request<T>(
  method: string,
  path: string,
  opts: RequestOpts & ApiRequestConfig = {},
): Promise<T> {
  if (opts.auth !== false) {
    const stored = getStoredSession();
    if (stored && stored.expiresAt - Date.now() < 60_000) {
      await refreshSessionOnce();
    }
  }

  try {
    return await rawRequest<T>(method, path, opts);
  } catch (error) {
    const unauthorized =
      error instanceof ApiError && error.status === 401 && opts.auth !== false && !opts.retry;
    if (!unauthorized) throw error;

    const refreshed = await refreshSessionOnce();
    if (!refreshed) {

      clearStoredSession();
      throw error;
    }
    return request<T>(method, path, { ...opts, retry: true });
  }
}

export const api = {
  get: <T>(path: string, opts?: ApiRequestConfig) => request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: ApiRequestConfig) =>
    request<T>('POST', path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: ApiRequestConfig) =>
    request<T>('PUT', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: ApiRequestConfig) =>
    request<T>('PATCH', path, { ...opts, body }),
  del: <T>(path: string, opts?: ApiRequestConfig) => request<T>('DELETE', path, opts),

  publicPost: <T>(path: string, body?: unknown, opts?: ApiRequestConfig) =>
    request<T>('POST', path, { ...opts, body, auth: false }),
  publicPatch: <T>(path: string, body?: unknown, opts?: ApiRequestConfig) =>
    request<T>('PATCH', path, { ...opts, body, auth: false }),

  publicGet: <T>(path: string, opts?: ApiRequestConfig) =>
    request<T>('GET', path, { ...opts, auth: false }),
};
