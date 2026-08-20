-- Отправка сообщения в поддержку: открытие/создание чата и вставка сообщения.
create or replace function public.send_support_message(p_text text)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  now_ts timestamptz := now();
  result jsonb;
begin
  insert into public.support_chats (user_id, is_open, updated_at)
  values (auth.uid(), true, now_ts)
  on conflict (user_id) do update set is_open = true, updated_at = now_ts;

  insert into public.support_messages (user_id, author_role, text)
  values (auth.uid(), 'user', p_text)
  returning jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'author_role', author_role,
    'text', text,
    'created_at', created_at
  ) into result;

  return result;
end;
$$;