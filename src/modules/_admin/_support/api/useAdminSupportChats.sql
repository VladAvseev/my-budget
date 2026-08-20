-- Админ: список чатов поддержки.
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