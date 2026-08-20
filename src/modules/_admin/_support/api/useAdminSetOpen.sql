-- Админ: открыть/закрыть чат поддержки.
create or replace function public.admin_set_support_open(p_user_id uuid, p_open boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Доступ запрещён';
  end if;

  update public.support_chats
  set is_open = p_open, updated_at = now()
  where user_id = p_user_id;
end;
$$;