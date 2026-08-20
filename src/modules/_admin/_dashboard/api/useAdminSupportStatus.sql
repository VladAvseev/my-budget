-- Админ: статус обращений в поддержку.
create or replace function public.admin_get_support_status()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
  open_count bigint;
  unanswered_count bigint;
  avg_hours numeric;
begin
  if not public.is_admin() then
    raise exception 'Доступ запрещён';
  end if;

  select count(*) into open_count
  from public.support_chats
  where is_open;

  select count(*) into unanswered_count
  from public.support_chats c
  left join lateral (
    select max(m.created_at) as last_admin_at
    from public.support_messages m
    where m.user_id = c.user_id
      and m.author_role = 'admin'
  ) a on true
  where c.is_open
    and (a.last_admin_at is null or a.last_admin_at < now() - interval '1 day');

  select round(avg(extract(epoch from (r.created_at - q.created_at)) / 3600.0), 1)
  into avg_hours
  from public.support_messages q
  join lateral (
    select min(m.created_at) as created_at
    from public.support_messages m
    where m.user_id = q.user_id
      and m.author_role = 'admin'
      and m.created_at > q.created_at
  ) r on true
  where q.author_role = 'user';

  select jsonb_build_object(
    'open', open_count,
    'unanswered', unanswered_count,
    'avgResponseHours', avg_hours
  ) into result;
  return result;
end;
$$;