-- Отчёты текущего пользователя (новые сверху).
create or replace function public.get_reports()
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
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
  ) order by period_start desc), '[]'::jsonb)
  into result
  from public.reports
  where user_id = auth.uid();

  return result;
end;
$$;