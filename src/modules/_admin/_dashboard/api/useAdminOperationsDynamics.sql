-- Админ: динамика количества операций по дням (в московском времени).
-- Группировка выполняется на стороне БД и возвращает по одной строке на сутки:
-- так выборка не упирается в лимит PostgREST db-max-rows (по умолчанию 1000),
-- который ранее обрезал выдачу «по строке на операцию» и терял свежие записи.
-- Сигнатура возврата изменилась, а Postgres не позволяет менять её через
-- CREATE OR REPLACE — поэтому сначала удаляем старую версию.
drop function if exists public.admin_get_operations_dynamics();
create or replace function public.admin_get_operations_dynamics()
returns table (day date, operations_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    (o.created_at at time zone 'Europe/Moscow')::date as day,
    count(*)::bigint as operations_count
  from public.operations o
  group by 1
  order by 1 asc;
$$;
