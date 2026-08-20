-- Админ: очистка чата поддержки.
create or replace function public.admin_clear_support_chat(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Доступ запрещён';
  end if;

  delete from public.support_messages where user_id = p_user_id;
  delete from public.support_chats where user_id = p_user_id;
end;
$$;