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
- **Markdown:** react-markdown@10 + remark-gfm (рендер юридических документов; async-чанк)
- **Окружение:** Node.js с ES-модулями (`"type": "module"`)

## Структура

- **Модули (страницы):** `src/modules/_<раздел>/`. Каждый модуль содержит `index.tsx` (экспортирует функцию, возвращающую `<Route>`) и `page.tsx` (экспортирует компонент `Page`). Подразделы admin-панели — вложенные модули (`_admin/_dashboard`, `_admin/_users` и т.д.).
- **Общее:** `src/shared/` — `ui/` (глупый UI-kit `V*` без бизнес-логики), `widgets/` (переиспользуемые виджеты с бизнес-логикой: `GrowthDynamicsCard`, `PeriodSummary`, `CurrencyRates`; дженерик-модели — в `model/` внутри виджета), `icons/` (собственные SVG-иконки), `theme/` (темы: `ThemeProvider`, `useTheme`, типы, `storage`, `theme.css` с дизайн-токенами), `api/` (HTTP-клиент, auth-сервис, типы, route-guards, `authProvider`, `hooks/` — общие хуки данных TanStack Query), `hooks/` (не-API хуки: `useBreakpoint`, `breakpoints`), `utils/` (форматирование, даты, ошибки), `styles/` (общие CSS-modules).
- **Маршруты:** собираются в `src/App.tsx` из функций модулей (login, registration, home, profile, reports, accumulations, overview, admin, legal, notFound). Вся таблица маршрутов обёрнута в `ConsentGate` (`@/shared/api/components/ConsentGate`): у авторизованного пользователя без действующего согласия поверх приложения рисуется блокирующее окно принятия (серверный 403 `error.code='CONSENT_REQUIRED'` у бизнес-запросов). На публичных `/legal/*` окно не рисуется — иначе ссылки на тексты документов из самого окна перекрывались бы им же.
- **Легальные документы:** на сайте два документа — `privacy_policy` (гейтящий: её принятие в gate'е и при регистрации = согласие на обработку ПДн, константа `GATING_DOCUMENT_TYPE`) и `terms_of_use` (информационный). Текст никогда не хранится в коде — `GET /legal/:type/current` (публичный, `api.publicGet`) и единый рендер `LegalDocumentView` (принимает опциональную `version`); страницы `/legal/privacy-policy` и `/legal/terms-of-use` (`modules/_legal`) и gate используют один хук `useLegalDocument`. Реестр slug ↔ document_type ↔ заголовок — `src/shared/legal/documents.ts` (зеркало серверного `KNOWN_DOCUMENT_TYPES`), переиспользуемые ссылки на оба документа — `src/shared/legal/LegalLinks` (футер лендинга, профиль; в регистрации и gate ссылки встроены в текст чекбокса); новый тип = правка сервера + этого реестра, в UI ничего не хардкодится. Согласие при регистрации — `authService.signUp(login, password, consent)`.

## Ключевые конвенции

- **Импорты:** только через алиас `@/*` → `src/*` (например, `@/shared/theme`, `@/App`).
- **Модули и переиспользование:** кросс-модульные импорты разрешены; общий каркас `AppLayout` живёт в `src/modules/_appLayout/` (модуль-обёртка без роута, реэкспорт из `index.tsx`) и импортируется разделами напрямую. Переиспользуемые UI и чистые утилиты поднимаются в `src/shared/`, бизнес-логика и хуки данных живут внутри своего модуля. Композиция маршрутов между модулями — только в `src/App.tsx` (например, `home({ guest })` получает лендинг извне).
- **Стилизация:** основной способ — CSS-modules (`*.module.css`). Дизайн-токены — M3-роли из `src/shared/theme/theme.css`: `--md-sys-color-*`, `--md-sys-shape-*`, `--md-sys-typescale-*`, `--md-sys-motion-*` и `--md-ref-typeface-*`. Имена из эталона не расширять; отсутствующие роли и параметры плотности хранить локально в CSS Modules. В TS цвета не дублировать; пользовательские цвета категорий сохраняются.
- **Тема:** приложение обёрнуто в `ThemeProvider` на верхнем уровне (`index.tsx`). Тема переключается через `useTheme().setTheme(name)`, выбор сохраняется в localStorage, на корневой элемент вешается атрибут `data-theme`. Доступные темы — `'dark'` (по умолчанию) и `'light'` (тип `ThemeName` в `@/shared/theme`). Токены SchemeTonalSpot от seed `#0099dc` находятся в `theme.css`. Переключатель «Тёмная тема» расположен в секции аккаунта профиля; невалидное сохранённое значение нормализуется в тёмную тему.
- **Работа с данными:** только через `api.get/post/put/patch/del` из `@/shared/api/http` (обёртка над axios; базовый путь `/api/v1`, envelope `{ data }` / `{ error }` разворачивается внутри; ошибки сервера бросаются как `ApiError` с русским `message`). Каждый метод принимает опциональный `{ signal }` — в `queryFn` всегда пробрасываем `({ signal }) => api.get(path, { signal })`, чтобы TanStack Query отменял устаревшие запросы через `AbortSignal`. Данные в UI — через хуки TanStack Query (`useQuery`/`useMutation`, ключи и оптимистичные обновления, утилиты из `@/shared/optimistic`); хуки лежат в `src/modules/_<раздел>/api/` и `@/shared/api/hooks`. Авторизация — `authService` из `@/shared/api/services/auth`. Пользователя сервер определяет по Bearer-токену, id в запросах не передаётся.
- **Типизация API:** `@/shared/api/types/domain.ts` — единственный источник правды о строках-сущностях БД (snake_case, зеркалят серверные DTO). Типы запросов/ответов конкретных эндпоинтов объявляются в файле хука TanStack, который их делает, поверх типов из `domain.ts`: `Use<Хук>Response` (данные `query.data`/возврат `mutationFn`, даже когда совпадает с DTO) и `Use<Хук>Request` (уходящие на сервер query/path/тело-параметры; для `useMutation` — payload UI; если тело отличается — неэкспортируемый `...Body`). Общие response-формы нескольких модулей (например `OperationSummary`, `SavingsOperation`) живут в хуке-владельце эндпоинта и переиспользуются через реэкспорт из `@/shared/api/hooks`; кросс-подраздельные фильтры и общие формы графиков (`AdminAudience`,
  `AdminChartMetric`, `AdminOperationsAggregation`, `AdminLogsBucket`,
  `AdminChartPoint`) — в `@/shared/api/types/admin`. Тестов нет — правки контрактов сверять с `server/src/modules/_*/types.ts`.
- **Локальное состояние форм и UI:** Jotai-атомы внутри модуля (`src/modules/_<раздел>/atoms/`) + `atomWithStorage` для персистентных значений.
- **Ленивая загрузка страниц:** маршруты подключают страницы через `AsyncPage(() => import('./page'))` из `@/shared/ui/AsyncPage` (React.lazy + Suspense), а не статическим импортом.
- **Защита маршрутов:** `ProtectedRoute`, `PublicRoute`, `RoleRoute` из `@/shared/api/components`. Авторизация через `AuthProvider` (`@/shared/api/authProvider`).
- **Компоненты:** функциональные, без классов. `react/prop-types` отключён — типы пропсов описываются через TypeScript.

## Переменные окружения

| Переменная   | Описание                          | По умолчанию               |
| ------------ | --------------------------------- | -------------------------- |
| `DEV_PORT`   | Порт dev-сервера                  | `3001`                     |
| `DEV_API_URL`| Цель прокси `/api` в dev-режиме   | `http://localhost:5001`    |

Секретов в бандле нет: API вызывается по same-origin `/api/v1` (в dev проксируется
на локальный Express — `server.proxy` в `rsbuild.config.ts`, по умолчанию
`DEV_API_URL=http://localhost:5001`).
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
