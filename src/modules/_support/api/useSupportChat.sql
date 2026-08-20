-- Чат поддержки пользователя: сообщения, статус и количество непрочитанных.
create or replace function public.get_support_chat(p_user_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  chat public.support_chats%rowtype;
  unread bigint;
begin
  select * into chat from public.support_chats where user_id = p_user_id;

  select count(*) into unread
  from public.support_messages m
  where m.user_id = p_user_id
    and m.author_role = 'admin'
    and (chat.user_read_at is null or m.created_at > chat.user_read_at);

  return jsonb_build_object(
    'messages', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.id,
        'user_id', m.user_id,
        'author_role', m.author_role,
        'text', m.text,
        'created_at', m.created_at
      ) order by m.created_at)
      from public.support_messages m
      where m.user_id = p_user_id
    ), '[]'::jsonb),
    'isOpen', coalesce(chat.is_open, false),
    'userReadAt', chat.user_read_at,
    'unreadCount', unread,
    'chatExists', chat.user_id is not null
  );
end;
$$;