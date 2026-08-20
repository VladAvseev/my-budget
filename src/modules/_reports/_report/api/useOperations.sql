-- Операции отчёта по типу (daily — по дате, остальные — по времени создания).
create or replace function public.get_operations_by_report(p_report_id uuid, p_type text)
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
    'report_id', report_id,
    'user_id', user_id,
    'type', type,
    'amount', amount,
    'category_id', category_id,
    'description', description,
    'date', date,
    'created_at', created_at,
    'updated_at', updated_at
  ) order by
    (case when p_type = 'daily' then date else null end) desc nulls last,
    created_at desc), '[]'::jsonb)
  into result
  from public.operations
  where report_id = p_report_id
    and type = p_type;

  return result;
end;
$$;