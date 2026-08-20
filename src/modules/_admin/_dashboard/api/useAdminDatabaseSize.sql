-- Админ: размер базы данных.
create or replace function public.admin_get_database_size()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Доступ запрещён';
  end if;

  select jsonb_build_object(
    'sizeBytes', coalesce(sum(pg_database_size(datname)), 0),
    'sizePretty', pg_size_pretty(coalesce(sum(pg_database_size(datname)), 0))
  ) into result
  from pg_database;
  return result;
end;
$$;