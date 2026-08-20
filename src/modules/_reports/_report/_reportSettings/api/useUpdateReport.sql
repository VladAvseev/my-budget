-- Обновление отчёта: либо имя, либо настройки ежедневных расходов.
create or replace function public.update_report(
  p_id uuid,
  p_name text default null,
  p_has_daily_expenses boolean default null,
  p_daily_budget numeric default null,
  p_period_start date default null,
  p_period_end date default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  if p_name is not null then
    update public.reports
    set name = p_name, updated_at = now()
    where id = p_id;
  elsif p_has_daily_expenses is not null then
    if p_has_daily_expenses then
      update public.reports
      set has_daily_expenses = true,
          daily_budget = p_daily_budget,
          period_start = p_period_start,
          period_end = p_period_end,
          updated_at = now()
      where id = p_id;
    else
      update public.reports
      set has_daily_expenses = false,
          daily_budget = null,
          period_start = null,
          period_end = null,
          updated_at = now()
      where id = p_id;
    end if;
  end if;

  select jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'name', name,
    'has_daily_expenses', has_daily_expenses,
    'daily_budget', daily_budget,
    'period_start', period_start,
    'period_end', period_end,
    'created_at', created_at,
    'updated_at', updated_at
  ) into result
  from public.reports
  where id = p_id;

  return result;
end;
$$;