-- Лимиты категорий отчёта (старые сверху).
create or replace function public.get_category_limits(p_report_id uuid)
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
    'category_id', category_id,
    'user_id', user_id,
    'amount', amount,
    'created_at', created_at,
    'updated_at', updated_at
  ) order by created_at), '[]'::jsonb)
  into result
  from public.category_limits
  where report_id = p_report_id;

  return result;
end;
$$;