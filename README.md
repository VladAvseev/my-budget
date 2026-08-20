# Мой бюджет

Фронтенд-приложение для учёта личного бюджета. React 19 + TypeScript + Rsbuild.

## Стек

- **Runtime:** React 19 + React DOM
- **Роутер:** React Router v7 (`react-router-dom`)
- **Сборщик:** Rsbuild (на основе Rspack)
- **Язык:** TypeScript (strict mode)
- **Линтер:** ESLint 9 (flat config)
- **Форматтер:** Prettier
- **Данные:** Supabase (`@supabase/supabase-js`) + TanStack Query (`@tanstack/react-query`)
- **Стейт-менеджмент:** Jotai (`jotai`)

## Быстрый старт

```bash
npm install
npm run dev
```

Dev-сервер запустится на порту из переменной `DEV_PORT` (по умолчанию 3001).

## Команды

| Команда             | Описание                                    |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Запуск dev-сервера с HMR                    |
| `npm run build`     | Production-сборка в `dist/`                 |
| `npm run preview`   | Просмотр production-сборки локально         |
| `npm run lint`      | Проверка кода линтером ESLint               |
| `npm run typecheck` | Проверка типов через `tsc --noEmit`         |
| `npm run format`    | Форматирование всего проекта через Prettier |

## Переменные окружения

| Переменная        | Описание                                      | По умолчанию |
| ----------------- | --------------------------------------------- | ------------ |
| `DEV_PORT`        | Порт dev-сервера                              | `3001`       |
| `SUPABASE_URL`    | URL проекта Supabase                          | —            |
| `SUPABASE_ANON_KEY` | Публичный anon-key Supabase                 | —            |

## Разделы

- Логин и регистрация (`/login`, `/registration`)
- Главная (`/`), профиль (`/profile`)
- Обзор (`/overview`), отчёты (`/reports`), накопления (`/accumulations`)
- Помощь (`/help`), поддержка (`/support`)
- Админ-панель (`/admin`: dashboard, users, support, news)

## Конвенции

- Импорты только через алиас `@/*` → `src/*`.
- Стилизация: CSS-modules + CSS-переменные из `theme.css`; дизайн-токены в TS не дублируются.
- Работа с данными только через сервисы `@/shared/supabase/services` и хуки TanStack Query.
- Страницы подключаются лениво через `AsyncPage` из `@/shared/ui/AsyncPage`.
- Подробнее — в `AGENTS.md`.