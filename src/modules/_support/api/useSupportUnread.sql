-- Количество непрочитанных сообщений админа в чате пользователя.
create or replace function public.get_support_unread_count(p_user_id uuid)
returns bigint
language plpgsql
security invoker
set search_path = public
as $$
declare
  user_read_at timestamptz;
  result bigint;
begin
  select c.user_read_at into user_read_at
  from public.support_chats c
  where c.user_id = p_user_id;

  select count(*) into result
  from public.support_messages m
  where m.user_id = p_user_id
    and m.author_role = 'admin'
    and (user_read_at is null or m.created_at > user_read_at);

  return result;
end;
$$;