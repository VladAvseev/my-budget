# Схема БД — объекты (кроме таблиц)

Инвентаризация выполнена через `_introspect.sql` (18.08.2026). Файлы отражают текущее состояние БД; их можно выполнять в SQL-редакторе Supabase для воспроизведения.

## Объекты

| Тип | Кол-во | Файл |
| --- | ------ | ---- |
| Функции | 14 | `functions.sql` |
| Триггеры | 2 | `triggers.sql` |
| Индексы | 18 (8 ручных + 10 от констрейнтов) | `indexes.sql` |
| RLS-политики | 30 | `policies.sql` |
| Гранты на функции | — | `grants.sql` |
| Расширения | 5 | `extensions.sql` |

## Таблицы с включённым RLS

`profiles`, `reports`, `categories`, `operations`, `accumulations`, `category_limits`, `news`, `support_chats`, `support_messages` — на всех RLS включён, принудительно (FORCE RLS) не форсируется.

## Отсутствуют пользовательские объекты

- Последовательности — нет (id в таблицах генерируются через uuid/identity).
- Представления (views) — нет.
- Пользовательские типы (enum/composite/domain) — нет.

## Примечания

- Админ-доступ реализован через `SECURITY DEFINER` RPC (`admin_get_*`), а не через RLS-политики с `is_admin()` — политики только owner-доступа.
- `is_admin()` — SECURITY DEFINER (иначе рекурсия RLS и HTTP 500).
- Все `SECURITY DEFINER`-функции имеют `set search_path = public`.

## Инструменты

- `_introspect.sql` — скрипт повторной инвентаризации: выполнить целиком в SQL-редакторе Supabase и сверить результаты.