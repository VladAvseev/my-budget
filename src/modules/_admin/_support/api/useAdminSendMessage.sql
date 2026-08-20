-- Админ: ответ в чат поддержки.
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