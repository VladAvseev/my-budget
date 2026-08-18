-- Инвентаризация объектов БД (кроме таблиц).
-- Выполнить целиком в SQL-редакторе Supabase и скопировать результат.
-- Результат используется для сборки документации в папке supabase/ (политики, индексы,
-- триггеры, последовательности, вьюхи, типы, гранты, расширения).

-- 1. Функции (готовый DDL CREATE FUNCTION)
select pg_get_functiondef(p.oid) as ddl
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.prokind in ('f', 'p')
  and p.oid not in (select d.objid from pg_depend d where d.deptype = 'e')
order by p.proname;

-- 2. Триггеры (включая on_auth_user_created на auth.users)
select
  n.nspname || '.' || c.relname as table_name,
  tg.tgname as trigger_name,
  pg_get_triggerdef(tg.oid) as ddl
from pg_trigger tg
join pg_class c on c.oid = tg.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where not tg.tgisinternal
  and (n.nspname = 'public' or (n.nspname = 'auth' and tg.tgname = 'on_auth_user_created'))
order by table_name, trigger_name;

-- 3. Индексы
select schemaname, tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
order by tablename, indexname;

-- 4. RLS-политики
select permissive, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 5. Последовательности
select sequence_schema, sequence_name, start_value, minimum_value, maximum_value, increment, cycle_option
from information_schema.sequences
where sequence_schema = 'public'
order by sequence_name;

-- 6. Представления
select table_name, view_definition
from information_schema.views
where table_schema = 'public'
order by table_name;

-- 7. Пользовательские типы (enum/composite; row-типы таблиц исключены)
select
  t.typname,
  t.typtype,
  case when t.typtype = 'e' then (
    select string_agg(e.enumlabel, ', ' order by e.enumsortorder)
    from pg_enum e
    where e.enumtypid = t.oid
  ) end as values
from pg_type t
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public'
  and t.typtype in ('e', 'c')
  and not exists (
    select 1
    from pg_class c
    where c.relnamespace = t.typnamespace
      and c.relname = t.typname
      and c.relkind in ('r', 'v', 'm', 'p', 'f')
  )
order by t.typname;

-- 8. Расширения
select extname, extversion
from pg_extension
order by extname;

-- 9. Гранты на таблицы и функции
select table_schema, table_name, grantee, privilege_type
from information_schema.table_privileges
where table_schema = 'public'
order by table_name, grantee, privilege_type;

select routine_schema, routine_name, grantee, privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
order by routine_name, grantee, privilege_type;

-- 10. Таблицы с включённым RLS
select relname as table_name, relrowsecurity, relforcerowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and relrowsecurity
order by relname;