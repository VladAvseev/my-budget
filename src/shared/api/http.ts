/**
 * HTTP-клиент REST-бэкенда my-budget (репозиторий `server/`, Express).
 *
 * Зоны ответственности:
 *   * обёртка над fetch с единым envelope ответа сервера:
 *     успех → { data }, ошибка → { error: { message, status } };
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

// ── ядро fetch ──────────────────────────────────────────────────────────────

interface RequestOpts {
  body?: unknown;
  /** false — не добавлять Bearer и не пытаться refresh (эндпоинты /auth/*). */
  auth?: boolean;
  /** внутренний флаг повтора после refresh — наружу не передаётся. */
  retry?: boolean;
}

async function rawRequest<T>(
  method: string,
  path: string,
  { body, auth = true }: RequestOpts = {},
): Promise<T> {
  const stored = auth ? getStoredSession() : null;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && stored?.accessToken) headers['Authorization'] = `Bearer ${stored.accessToken}`;

  const response = await fetch(`/api/v1${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content (logout, DELETE-эндпоинты)
  if (response.status === 204) {
    return null as T;
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    /* не-JSON ответ (502 от nginx и т.п.) — обработаем ниже как ошибку */
  }

  if (!response.ok) {
    const message =
      (payload as { error?: { message?: string } })?.error?.message ??
      `Ошибка запроса (${response.status})`;
    throw new ApiError(message, response.status);
  }

  // Сервер всегда оборачивает успех в { data } — снимаем обёртку.
  const envelope = payload as { data?: T };
  return envelope?.data as T;
}

/**
 * Запрос с авто-обновлением токена:
 *  * если access близок к истечению (< 60 c) — обновляем заранее;
 *  * на 401 (кроме самих /auth/*) — один refresh и точный повтор запроса;
 *  * не удалось обновиться — локальный logout (эмит события, провайдер
 *    переведёт приложение на /login).
 */
async function request<T>(method: string, path: string, opts: RequestOpts = {}): Promise<T> {
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
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) =>
    request<T>('POST', path, body === undefined ? {} : { body }),
  put: <T>(path: string, body?: unknown) =>
    request<T>('PUT', path, body === undefined ? {} : { body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>('PATCH', path, body === undefined ? {} : { body }),
  del: <T>(path: string) => request<T>('DELETE', path),
  /** запросы без Bearer/refresh: /auth/register, /auth/login, /auth/refresh. */
  publicPost: <T>(path: string, body?: unknown) => request<T>('POST', path, { body, auth: false }),
  publicPatch: <T>(path: string, body?: unknown) =>
    request<T>('PATCH', path, { body, auth: false }),
};
