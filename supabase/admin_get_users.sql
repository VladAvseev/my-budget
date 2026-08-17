-- Таблица пользователей для админ-панели.
-- SECURITY DEFINER — обходит RLS, поэтому доступ явно проверяется через is_admin().
create or replace function public.admin_get_users()
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

  select jsonb_agg(jsonb_build_object(
    'user_id', p.user_id,
    'email', p.email,
    'last_active_at', p.last_active_at,
    'onboarded', p.onboarded,
    'sawNews', not p.show_news,
    'reportsCount', coalesce(r.cnt, 0),
    'operationsCount', coalesce(o.cnt, 0)
  ))
  into result
  from public.profiles p
  left join (
    select user_id, count(*) as cnt
    from public.reports
    group by user_id
  ) r on r.user_id = p.user_id
  left join (
    select user_id, count(*) as cnt
    from public.operations
    group by user_id
  ) o on o.user_id = p.user_id;

  return coalesce(result, '[]'::jsonb);
end;
$$;

-- Функцию могут вызывать только авторизованные пользователи.
revoke all on function public.admin_get_users() from public;
revoke all on function public.admin_get_users() from anon;
grant execute on function public.admin_get_users() to authenticated;