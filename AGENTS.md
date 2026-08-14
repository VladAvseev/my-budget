# AGENTS.md

## О проекте

Фронтенд-приложение для учёта личного бюджета. Разрабатывается на основе React 19 + TypeScript + Rsbuild. Исходный код — русскоязычный (тексты UI, комментарии, сообщения об ошибках).

## Стек

- **Runtime:** React 19
- **Сборщик:** Rsbuild (на основе Rspack)
- **Язык:** TypeScript (strict mode)
- **Линтер:** ESLint 9 (flat config)
- **Форматтер:** Prettier
- **Данные:** Supabase (`@supabase/supabase-js`) + TanStack Query (`@tanstack/react-query`)
- **Окружение:** Node.js с ES-модулями (`"type": "module"`)

## Ключевые конвенции

- **Импорты:** только через алиас `@/*` → `src/*` (например, `@/shared/theme`, `@/App`).
- **Стилизация:** использовать `useThemeStyles()` из `@/shared/theme` и дизайн-токены (`styles.colors`, `styles.spacing`, `styles.radius`, `styles.shadow`, `styles.typography`). Не хардкодить цвета, отступы и размеры в компонентах.
- **Тема:** приложение обёрнуто в `ThemeProvider` на верхнем уровне (`index.tsx`). Тема переключается через `useTheme().setTheme('light' | 'dark')`, выбор сохраняется в localStorage.
- **Работа с данными:** только через сервисы в `@/shared/supabase/services` (общая инициализация клиента в `supabase.ts`). Данные в UI — через хуки TanStack Query (`useQuery`/`useMutation`, ключи и оптимистичные обновления). Запросы выбирают только нужные колонки и включают `enabled`-условия.
- **Ленивая загрузка страниц:** маршруты подключают страницы через `AsyncPage(() => import('./page'))` из `@/shared/ui/AsyncPage` (React.lazy + Suspense), а не статическим импортом.
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
