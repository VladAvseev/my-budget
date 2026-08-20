-- Отключение ежедневных расходов: удаление daily-операций и сброс настроек отчёта.
create or replace function public.disable_daily_expenses(p_report_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.operations
  where report_id = p_report_id
    and type = 'daily';

  update public.reports
  set has_daily_expenses = false,
      daily_budget = null,
      period_start = null,
      period_end = null,
      updated_at = now()
  where id = p_report_id;
end;
$$;