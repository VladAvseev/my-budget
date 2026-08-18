-- Функция аналитики дашборда.
-- SECURITY DEFINER — обходит RLS, поэтому доступ явно проверяется через is_admin().
create or replace function public.admin_get_dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Доступ запрещён';
  end if;

  return jsonb_build_object(
    'users', (
      select jsonb_build_object(
        'total', count(*),
        'withoutReports', count(*) filter (
          where not exists (
            select 1 from public.reports r where r.user_id = p.user_id
          )
        ),
        'onboarded', count(*) filter (where p.onboarded),
        'sawNews', count(*) filter (where not p.show_news)
      )
      from public.profiles p
    ),
    'activity', (
      select jsonb_build_object(
        'dau', count(*) filter (where p.last_active_at >= now() - interval '1 day'),
        'wau', count(*) filter (where p.last_active_at >= now() - interval '7 days'),
        'mau', count(*) filter (where p.last_active_at >= now() - interval '30 days'),
        'qau', count(*) filter (where p.last_active_at >= now() - interval '90 days'),
        'sau', count(*) filter (where p.last_active_at >= now() - interval '180 days'),
        'yau', count(*) filter (where p.last_active_at >= now() - interval '365 days')
      )
      from public.profiles p
    ),
    'churn', (
      select jsonb_build_object(
        'inactive1d', count(*) filter (
          where p.last_active_at is null or p.last_active_at < now() - interval '1 day'
        ),
        'inactive7d', count(*) filter (
          where p.last_active_at is null or p.last_active_at < now() - interval '7 days'
        ),
        'inactive30d', count(*) filter (
          where p.last_active_at is null or p.last_active_at < now() - interval '30 days'
        ),
        'inactive90d', count(*) filter (
          where p.last_active_at is null or p.last_active_at < now() - interval '90 days'
        ),
        'inactive180d', count(*) filter (
          where p.last_active_at is null or p.last_active_at < now() - interval '180 days'
        ),
        'inactive365d', count(*) filter (
          where p.last_active_at is null or p.last_active_at < now() - interval '365 days'
        )
      )
      from public.profiles p
    ),
    'reports', (
      select jsonb_build_object(
        'total', count(*),
        'withDailyExpenses', count(*) filter (where r.has_daily_expenses)
      )
      from public.reports r
    ),
    'operations', (
      select jsonb_build_object(
        'total', count(*),
        'income', count(*) filter (where o.type = 'income'),
        'expense', count(*) filter (where o.type = 'expense'),
        'daily', count(*) filter (where o.type = 'daily'),
        'savings', count(*) filter (where o.type in ('savings', 'savings_out'))
      )
      from public.operations o
    )
  );
end;
$$;

-- Функцию могут вызывать только авторизованные пользователи.
revoke all on function public.admin_get_dashboard_stats() from public;
revoke all on function public.admin_get_dashboard_stats() from anon;
grant execute on function public.admin_get_dashboard_stats() to authenticated;