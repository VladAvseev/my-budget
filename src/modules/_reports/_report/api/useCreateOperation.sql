-- Создание операции в отчёте текущим пользователем.
create or replace function public.create_operation(
  p_report_id uuid,
  p_type text,
  p_amount numeric,
  p_category_id uuid,
  p_description text,
  p_date date
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  insert into public.operations (report_id, user_id, type, amount, category_id, description, date)
  values (p_report_id, auth.uid(), p_type, p_amount, p_category_id, p_description, p_date)
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