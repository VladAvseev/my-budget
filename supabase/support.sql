-- Функции администратора.
-- SECURITY DEFINER — обходит RLS, поэтому доступ явно проверяется через is_admin().

-- Список чатов: только пользователи с сообщениями, с количеством непрочитанных.
create or replace function public.admin_get_support_chats()
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

  select coalesce(jsonb_agg(row order by row->>'lastAt' desc nulls last), '[]'::jsonb)
  into result
  from (
    select jsonb_build_object(
      'user_id', c.user_id,
      'email', p.email,
      'isOpen', c.is_open,
      'unreadCount', coalesce((
        select count(*)
        from public.support_messages m
        where m.user_id = c.user_id
          and m.author_role = 'user'
          and (c.admin_read_at is null or m.created_at > c.admin_read_at)
      ), 0),
      'lastText', (
        select m.text
        from public.support_messages m
        where m.user_id = c.user_id
        order by m.created_at desc
        limit 1
      ),
      'lastAt', (
        select m.created_at::text
        from public.support_messages m
        where m.user_id = c.user_id
        order by m.created_at desc
        limit 1
      )
    ) as row
    from public.support_chats c
    join public.profiles p on p.user_id = c.user_id
    where exists (
      select 1 from public.support_messages m where m.user_id = c.user_id
    )
  ) t;

  return result;
end;
$$;

-- Чат конкретного пользователя: сообщения + статус. Помечает прочитанным.
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

-- Ответ администратора.
create or replace function public.admin_send_support_message(p_user_id uuid, p_text text)
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
    raise exception 'Чат не найден';
  end if;

  insert into public.support_messages (user_id, author_role, text)
  values (p_user_id, 'admin', p_text)
  returning jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'author_role', author_role,
    'text', text,
    'created_at', created_at
  ) into result;

  update public.support_chats
  set admin_read_at = now(), updated_at = now()
  where user_id = p_user_id;

  return result;
end;
$$;

-- Открыть/закрыть проблему.
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

-- Очистка чата: удаление всех сообщений и записи чата (проблема закрывается).
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

-- Количество открытых проблем (для бейджа таба).
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

-- Функции могут вызывать только авторизованные пользователи.
revoke all on function public.admin_get_support_chats() from public;
revoke all on function public.admin_get_support_chats() from anon;
grant execute on function public.admin_get_support_chats() to authenticated;

revoke all on function public.admin_get_support_chat(uuid) from public;
revoke all on function public.admin_get_support_chat(uuid) from anon;
grant execute on function public.admin_get_support_chat(uuid) to authenticated;

revoke all on function public.admin_send_support_message(uuid, text) from public;
revoke all on function public.admin_send_support_message(uuid, text) from anon;
grant execute on function public.admin_send_support_message(uuid, text) to authenticated;

revoke all on function public.admin_set_support_open(uuid, boolean) from public;
revoke all on function public.admin_set_support_open(uuid, boolean) from anon;
grant execute on function public.admin_set_support_open(uuid, boolean) to authenticated;

revoke all on function public.admin_clear_support_chat(uuid) from public;
revoke all on function public.admin_clear_support_chat(uuid) from anon;
grant execute on function public.admin_clear_support_chat(uuid) to authenticated;

revoke all on function public.admin_get_support_open_count() from public;
revoke all on function public.admin_get_support_open_count() from anon;
grant execute on function public.admin_get_support_open_count() to authenticated;