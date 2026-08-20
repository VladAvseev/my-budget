-- Создание отчёта текущим пользователем.
create or replace function public.create_report(
  p_name text,
  p_has_daily_expenses boolean,
  p_daily_budget numeric,
  p_period_start date,
  p_period_end date
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  insert into public.reports (user_id, name, has_daily_expenses, daily_budget, period_start, period_end)
  values (
    auth.uid(),
    p_name,
    coalesce(p_has_daily_expenses, false),
    case when coalesce(p_has_daily_expenses, false) then p_daily_budget else null end,
    case when coalesce(p_has_daily_expenses, false) then p_period_start else null end,
    case when coalesce(p_has_daily_expenses, false) then p_period_end else null end
  )
  returning jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'name', name,
    'has_daily_expenses', has_daily_expenses,
    'daily_budget', daily_budget,
    'period_start', period_start,
    'period_end', period_end,
    'created_at', created_at,
    'updated_at', updated_at
  ) into result;

  return result;
end;
$$;