-- Операции накоплений пользователя (вклад + снятие) с данными отчёта.
create or replace function public.get_savings_operations(p_user_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(row order by row->>'reportPeriodStart' desc, row->>'created_at' desc), '[]'::jsonb)
  into result
  from (
    select jsonb_build_object(
      'id', o.id,
      'report_id', o.report_id,
      'user_id', o.user_id,
      'type', o.type,
      'amount', o.amount,
      'category_id', o.category_id,
      'description', o.description,
      'date', o.date,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'reportName', r.name,
      'reportPeriodStart', r.period_start
    ) as row
    from public.operations o
    join public.reports r on r.id = o.report_id
    where o.user_id = p_user_id
      and o.type in ('savings', 'savings_out')
  ) t;

  return result;
end;
$$;