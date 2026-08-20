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
- **Данные:** Supabase (`@supabase/supabase-js`) + TanStack Query (`@tanstack/react-query`)
- **Стейт-менеджмент:** Jotai (`jotai`, включая `atomWithStorage`)
- **Окружение:** Node.js с ES-модулями (`"type": "module"`)

## Структура

- **Модули (страницы):** `src/modules/_<раздел>/`. Каждый модуль содержит `index.tsx` (экспортирует функцию, возвращающую `<Route>`) и `page.tsx` (экспортирует компонент `Page`). Подразделы admin-панели — вложенные модули (`_admin/_dashboard`, `_admin/_users` и т.д.).
- **Общее:** `src/shared/` — `ui/` (UI-kit `V*`), `icons/` (собственные SVG-иконки), `theme/` (темы и дизайн-токены), `supabase/` (клиент, сервисы, типы, route-guards, `authProvider`), `hooks/` (хуки TanStack Query), `utils/` (форматирование, даты, ошибки), `styles/` (общие CSS-modules).
- **Маршруты:** собираются в `src/App.tsx` из функций модулей (login, registration, home, profile, reports, accumulations, overview, help, support, admin, notFound).

## Ключевые конвенции

- **Импорты:** только через алиас `@/*` → `src/*` (например, `@/shared/theme`, `@/App`).
- **Стилизация:** `useThemeStyles()` из `@/shared/theme` для дизайн-токенов (`styles.colors`, `styles.spacing`, `styles.radius`, `styles.shadow`, `styles.typography`) и CSS-modules (`*.module.css`) для локальных стилей. Не хардкодить цвета, отступы и размеры в компонентах.
- **Тема:** приложение обёрнуто в `ThemeProvider` на верхнем уровне (`index.tsx`). Тема переключается через `useTheme().setTheme(name)`, выбор сохраняется в localStorage, на корневой элемент вешается атрибут `data-theme`. Доступные темы — `'dark'` (по умолчанию), `'light'`, `'cream'`, `'orange'` (тип `ThemeName` в `@/shared/theme`). Наборы токенов лежат в `src/shared/theme/packs/`.
- **Работа с данными:** только через сервисы в `@/shared/supabase/services` (общая инициализация клиента в `@/shared/supabase/supabase.ts`). Данные в UI — через хуки TanStack Query (`useQuery`/`useMutation`, ключи и оптимистичные обновления, утилиты из `@/shared/optimistic`). Запросы выбирают только нужные колонки и включают `enabled`-условия. Частые хуки вынесены в `@/shared/hooks`.
- **Локальное состояние форм и UI:** Jotai-атомы внутри модуля (`src/modules/_<раздел>/atoms/`) + `atomWithStorage` для персистентных значений.
- **Ленивая загрузка страниц:** маршруты подключают страницы через `AsyncPage(() => import('./page'))` из `@/shared/ui/AsyncPage` (React.lazy + Suspense), а не статическим импортом.
- **Защита маршрутов:** `ProtectedRoute`, `PublicRoute`, `RoleRoute` из `@/shared/supabase/components`. Авторизация через `AuthProvider` (`@/shared/supabase/authProvider`).
- **Компоненты:** функциональные, без классов. `react/prop-types` отключён — типы пропсов описываются через TypeScript.

## Переменные окружения

| Переменная        | Описание                                          | По умолчанию     |
| ----------------- | ------------------------------------------------- | ---------------- |
| `DEV_PORT`        | Порт dev-сервера                                  | `3001`           |
| `SUPABASE_URL`    | URL проекта Supabase                              | —                |
| `SUPABASE_ANON_KEY` | Публичный anon-key Supabase                     | —                |

## Команды

| Команда           | Описание                                            |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Запуск dev-сервера с HMR                            |
| `npm run build`   | Production-сборка в `dist/`                         |
| `npm run preview` | Просмотр production-сборки локально                 |
| `npm run lint`    | Проверка кода линтером ESLint (только вывод ошибок) |
| `npm run format`  | Форматирование всего проекта через Prettier         |
| `npm run typecheck` | Проверка типов через `tsc --noEmit`              |

Примечание: отдельной команды тестов в проекте нет.