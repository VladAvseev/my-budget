-- Отметить чат прочитанным (по последнему сообщению админа).
create or replace function public.mark_support_read()
returns void
language plpgsql
security invoker
set search_path = public
as $$
<<fn>>
declare
  last_admin_at timestamptz;
  user_read_at timestamptz;
begin
  select max(created_at) into last_admin_at
  from public.support_messages
  where user_id = auth.uid()
    and author_role = 'admin';

  user_read_at := greatest(coalesce(last_admin_at, now()), now());

  update public.support_chats
  set user_read_at = fn.user_read_at, updated_at = now()
  where user_id = auth.uid();
end;
$$;