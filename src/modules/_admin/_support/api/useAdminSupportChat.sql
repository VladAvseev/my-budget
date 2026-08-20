-- Админ: сообщения и статус чата пользователя (помечает чат прочитанным).
create or replace function public.admin_get_support_chat(p_user_id uuid)
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

  if not exists (select 1 from public.support_chats c where c.user_id = p_user_id) then
    return null;
  end if;

  update public.support_chats
  set admin_read_at = now(), updated_at = now()
  where user_id = p_user_id;

  select jsonb_build_object(
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
    'isOpen', c.is_open
  )
  into result
  from public.support_chats c
  where c.user_id = p_user_id;

  return result;
end;
$$;