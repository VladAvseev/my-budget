-- Сводка операций отчёта по типам.
create or replace function public.get_report_summary(p_report_id uuid)
returns jsonb
language sql
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'income', coalesce(sum(amount::numeric) filter (where type = 'income'), 0),
    'expense', coalesce(sum(amount::numeric) filter (where type = 'expense'), 0),
    'savings', coalesce(sum(amount::numeric) filter (where type = 'savings'), 0)
      - coalesce(sum(amount::numeric) filter (where type = 'savings_out'), 0),
    'daily', coalesce(sum(amount::numeric) filter (where type = 'daily'), 0)
  )
  from public.operations
  where report_id = p_report_id;
$$;