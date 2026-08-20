-- Админ: количество открытых чатов.
create or replace function public.admin_get_support_open_count()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  result bigint;
begin
  if not public.is_admin() then
    raise exception 'Доступ запрещён';
  end if;

  select count(*) into result from public.support_chats where is_open;
  return result;
end;
$$;