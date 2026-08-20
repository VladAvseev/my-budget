-- Обновление операции. Тип и дата обновляются только если переданы.
create or replace function public.update_operation(
  p_id uuid,
  p_amount numeric,
  p_category_id uuid,
  p_description text,
  p_type text default null,
  p_date date default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  update public.operations o
  set amount = p_amount,
      category_id = p_category_id,
      description = p_description,
      type = coalesce(p_type, o.type),
      date = coalesce(p_date, o.date),
      updated_at = now()
  where o.id = p_id
  returning jsonb_build_object(
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
  ) into result;

  return result;
end;
$$;