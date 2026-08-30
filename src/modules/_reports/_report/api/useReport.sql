-- Отчёт по id.
create or replace function public.get_report(p_report_id uuid)
returns jsonb
language sql
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'name', name,
    'code', code,
    'has_daily_expenses', has_daily_expenses,
    'daily_budget', daily_budget,
    'period_start', period_start,
    'period_end', period_end,
    'created_at', created_at,
    'updated_at', updated_at
  )
  from public.reports
  where id = p_report_id;
$$;