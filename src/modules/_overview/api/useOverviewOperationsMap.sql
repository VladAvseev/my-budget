-- Операции по нескольким отчётам (только поля для сводки: тип, сумма, категория).
create or replace function public.get_operations_by_reports(p_report_ids uuid[])
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'report_id', report_id,
    'type', type,
    'amount', amount,
    'category_id', category_id
  )), '[]'::jsonb)
  into result
  from public.operations
  where report_id = any(p_report_ids);

  return result;
end;
$$;