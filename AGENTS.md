# AGENTS.md

## О проекте

Фронтенд-приложение для учёта личного бюджета. Разрабатывается на основе React 19 + TypeScript + Rsbuild. Исходный код — русскоязычный (тексты UI, комментарии, сообщения об ошибках).

## Стек

- **Runtime:** React 19 + React DOM
- **Роутер:** React Router v7 (`react-router-dom`)
- **Сборщик:** Rsbuild (на основе Rspack)
- **Язык:** TypeScript (strict mode)
- **Линтер:** ESLint 9 (flat config)
- **Форматтер:** Prettier
- **Данные:** собственный REST-бэкенд (`server/`, Express) через axios-клиент `src/shared/api/http.ts` + TanStack Query (`@tanstack/react-query`)
- **Стейт-менеджмент:** Jotai (`jotai`, включая `atomWithStorage`)
- **Окружение:** Node.js с ES-модулями (`"type": "module"`)

## Структура

- **Модули (страницы):** `src/modules/_<раздел>/`. Каждый модуль содержит `index.tsx` (экспортирует функцию, возвращающую `<Route>`) и `page.tsx` (экспортирует компонент `Page`). Подразделы admin-панели — вложенные модули (`_admin/_dashboard`, `_admin/_users` и т.д.).
- **Общее:** `src/shared/` — `ui/` (UI-kit `V*`), `icons/` (собственные SVG-иконки), `theme/` (темы: `ThemeProvider`, `useTheme`, типы, `storage`, `theme.css` с дизайн-токенами), `api/` (HTTP-клиент, auth-сервис, типы, route-guards, `authProvider`, `hooks/` — общие хуки данных TanStack Query), `hooks/` (не-API хуки: `useBreakpoint`, `breakpoints`), `utils/` (форматирование, даты, ошибки), `styles/` (общие CSS-modules).
- **Маршруты:** собираются в `src/App.tsx` из функций модулей (login, registration, home, profile, reports, accumulations, overview, admin, notFound).

## Ключевые конвенции

- **Импорты:** только через алиас `@/*` → `src/*` (например, `@/shared/theme`, `@/App`).
- **Изоляция модулей:** импорты между модулями (`@/modules/_X` внутри `_Y`) запрещены (контролируется правилом `no-restricted-syntax` в ESLint): переиспользуемые UI и чистые утилиты поднимаются в `src/shared/`, бизнес-логика и хуки данных живут внутри своего модуля (допустимо похожий код в разных модулях). Композиция маршрутов между модулями — только в `src/App.tsx` (например, `home({ guest })` получает лендинг извне).
- **Стилизация:** основной способ — CSS-modules (`*.module.css`). Дизайн-токены — CSS-переменные из `src/shared/theme/theme.css` (`var(--color-*)`, `var(--space-*)`, `var(--radius-*)`, `var(--shadow-*)`, `var(--font-*)`), в TS не дублируются (исключение — `breakpoints` в `src/shared/hooks/breakpoints.ts`, нужен только для `useBreakpoint`). Не хардкодить цвета, отступы и размеры в компонентах.
- **Тема:** приложение обёрнуто в `ThemeProvider` на верхнем уровне (`index.tsx`). Тема переключается через `useTheme().setTheme(name)`, выбор сохраняется в localStorage, на корневой элемент вешается атрибут `data-theme`. Доступные темы — `'dark'` (по умолчанию), `'light'`, `'cream'`, `'orange'` (тип `ThemeName` в `@/shared/theme`). Наборы токенов лежат в `src/shared/theme/packs/`.
- **Работа с данными:** только через `api.get/post/put/patch/del` из `@/shared/api/http` (обёртка над axios; базовый путь `/api/v1`, envelope `{ data }` / `{ error }` разворачивается внутри; ошибки сервера бросаются как `ApiError` с русским `message`). Каждый метод принимает опциональный `{ signal }` — в `queryFn` всегда пробрасываем `({ signal }) => api.get(path, { signal })`, чтобы TanStack Query отменял устаревшие запросы через `AbortSignal`. Данные в UI — через хуки TanStack Query (`useQuery`/`useMutation`, ключи и оптимистичные обновления, утилиты из `@/shared/optimistic`); хуки лежат в `src/modules/_<раздел>/api/` и `@/shared/api/hooks`. Авторизация — `authService` из `@/shared/api/services/auth`. Пользователя сервер определяет по Bearer-токену, id в запросах не передаётся.
- **Локальное состояние форм и UI:** Jotai-атомы внутри модуля (`src/modules/_<раздел>/atoms/`) + `atomWithStorage` для персистентных значений.
- **Ленивая загрузка страниц:** маршруты подключают страницы через `AsyncPage(() => import('./page'))` из `@/shared/ui/AsyncPage` (React.lazy + Suspense), а не статическим импортом.
- **Защита маршрутов:** `ProtectedRoute`, `PublicRoute`, `RoleRoute` из `@/shared/api/components`. Авторизация через `AuthProvider` (`@/shared/api/authProvider`).
- **Компоненты:** функциональные, без классов. `react/prop-types` отключён — типы пропсов описываются через TypeScript.

## Переменные окружения

| Переменная | Описание         | По умолчанию |
| ---------- | ---------------- | ------------ |
| `DEV_PORT` | Порт dev-сервера | `3001`       |

Секретов в бандле нет: API вызывается по same-origin `/api/v1` (в dev проксируется
на локальный Express — `server.proxy` в `rsbuild.config.ts`, порты 5001).
В проде `/api/` проксирует nginx контейнера `web`.

## Команды

| Команда             | Описание                                            |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Запуск dev-сервера с HMR                            |
| `npm run build`     | Production-сборка в `dist/`                         |
| `npm run preview`   | Просмотр production-сборки локально                 |
| `npm run lint`      | Проверка кода линтером ESLint (только вывод ошибок) |
| `npm run format`    | Форматирование всего проекта через Prettier         |
| `npm run typecheck` | Проверка типов через `tsc --noEmit`                 |

Примечание: отдельной команды тестов в проекте нет.
