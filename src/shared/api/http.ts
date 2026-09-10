/**
 * HTTP-клиент REST-бэкенда my-budget (репозиторий `server/`, Express).
 *
 * Зоны ответственности:
 *   * обёртка над axios с единым envelope ответа сервера:
 *     успех → { data }, ошибка → { error: { message, status } };
 *   * поддержка AbortSignal в каждом методе — TanStack Query может отменить
 *     запрос (сигнал гаснет, axios бросает CanceledError, наружу отдаём
 *     signal.reason, чтобы Query корректно перевёл запрос в cancelled);
 *   * хранение пары токенов в localStorage и их автоочистка;
 *   * автообновление access-токена по истечении и при 401, с одно-полётной
 *     очередью: параллельные запросы во время refresh ждут один Promise,
 *     а не дерут /auth/refresh каждый;
 *   * события изменения сессии для auth-провайдера.
 *
 * Базовый путь '/api/v1' — same-origin: в проде nginx web-контейнера
 * проксирует /api/ на Express, в dev тот же прокси настроен в
 * rsbuild.config.ts (server.proxy). Секретов в бандле нет — только JWT.
 */

import axios, { AxiosError, type GenericAbortSignal } from 'axios';

export interface ApiUser {
  /** публичный профиль из ответа сервера (camelCase, см. _users/types.ts сервера). */
  id: string;
  email: string;
  role: string;
  startBalance: number;
  currency: string | null;
  onboarded: boolean;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Ответ /auth/register|login|refresh в терминах, понятных клиенту. */
export interface ApiSession {
  accessToken: string;
  refreshToken: string;
  /** секунды до истечения access-токена (сервер отдаёт как в OAuth). */
  expiresIn: number;
  user: ApiUser;
}

/** То же + абсолютное время жизни access-токена в ms (Date.now()-эпоха). */
export interface StoredSession extends ApiSession {
  expiresAt: number;
}

/** Опции запроса для потребителей api.* (передаются в queryFn/mutationFn). */
export interface ApiRequestConfig {
  /** AbortSignal из контекста TanStack Query ({ signal }) => api.get(path, { signal }). */
  signal?: AbortSignal;
}

const STORAGE_KEY = '***';

/** Ошибка API: HTTP-статус + текст, который сервер уже отдаёт по-русски. */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ── Хранилище сессии ────────────────────────────────────────────────────────

export function getStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
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

// ── Шина событий сессии ─────────────────────────────────────────────────────
// Провайдер получает уведомление при любом изменении хранилища; конкретные
// события SIGNED_IN/SIGNED_OUT надстраивает services/auth.ts.

type SessionListener = () => void;
const listeners = new Set<SessionListener>();

export function subscribeSessionChange(cb: SessionListener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function emitSessionChange(): void {
  listeners.forEach((cb) => cb());
}

// ── Refresh с одно-полётной очередью ────────────────────────────────────────

let refreshPromise: Promise<boolean> | null = null;

/**
 * Обновить пару токенов. Параллельные вызовы переиспользуют один запрос.
 * false = refresh-токена нет/просрочен/отозван → сессия уничтожена.
 */
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
    } finally {
      // Сбрасываем флаг асинхронно, чтобы все ждущие получили тот же результат.
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

// ── ядро axios ──────────────────────────────────────────────────────────────

/** Причина отмены от TanStack Query / прочего AbortController, либо сам error. */
function cancelReason(signal: GenericAbortSignal | undefined, fallback: unknown): unknown {
  const aborted = signal as AbortSignal | undefined;
  if (aborted && typeof aborted === 'object' && aborted.aborted) return aborted.reason ?? fallback;
  return fallback;
}

const http = axios.create({
  baseURL: '/api/v1',
});

// Успех: снимаем envelope { data }; 204 No Content (logout, DELETE) → null.
http.interceptors.response.use((response) => {
  if (response.status === 204) return null as never;
  const envelope = response.data as { data?: unknown } | null | undefined;
  return (envelope?.data ?? null) as never;
});

// Ошибка: AxiosError → ApiError (русский текст сервера + HTTP-статус),
// отмена → reason сигнала, чтобы Query распознал отмену, а не ошибку.
http.interceptors.response.use(undefined, (error: unknown) => {
  if (error instanceof AxiosError) {
    if (axios.isCancel(error)) {
      return Promise.reject(cancelReason(error.config?.signal, error));
    }
    if (error.response) {
      const message =
        (error.response.data as { error?: { message?: string } })?.error?.message ??
        `Ошибка запроса (${error.response.status})`;
      return Promise.reject(new ApiError(message, error.response.status));
    }
    return Promise.reject(new ApiError('Нет связи с сервером', 0));
  }
  return Promise.reject(error);
});

interface RequestOpts {
  body?: unknown;
  /** false — не добавлять Bearer и не пытаться refresh (эндпоинты /auth/*). */
  auth?: boolean;
  /** внутренний флаг повтора после refresh — наружу не передаётся. */
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

  // Интерцептор выше разворачивает AxiosResponse в уже очищенные данные,
  // поэтому типы ядра не отражают реальный возвращаемый результат.
  const data = await http.request({ method, url: path, data: body, headers, signal });
  return data as unknown as T;
}

/**
 * Запрос с авто-обновлением токена:
 *  * если access близок к истечению (< 60 c) — обновляем заранее;
 *  * на 401 (кроме самих /auth/*) — один refresh и точный повтор запроса
 *    с тем же signal;
 *  * не удалось обновиться — локальный logout (эмит события, провайдер
 *    переведёт приложение на /login).
 */
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
      // Сессии реально больше нет (отзыв/истечение) — выход.
      clearStoredSession();
      throw error;
    }
    return request<T>(method, path, { ...opts, retry: true });
  }
}

// ── Публичный API модуля ────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, opts?: ApiRequestConfig) => request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: ApiRequestConfig) =>
    request<T>('POST', path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: ApiRequestConfig) =>
    request<T>('PUT', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: ApiRequestConfig) =>
    request<T>('PATCH', path, { ...opts, body }),
  del: <T>(path: string, opts?: ApiRequestConfig) => request<T>('DELETE', path, opts),
  /** запросы без Bearer/refresh: /auth/register, /auth/login, /auth/refresh. */
  publicPost: <T>(path: string, body?: unknown, opts?: ApiRequestConfig) =>
    request<T>('POST', path, { ...opts, body, auth: false }),
  publicPatch: <T>(path: string, body?: unknown, opts?: ApiRequestConfig) =>
    request<T>('PATCH', path, { ...opts, body, auth: false }),
};
