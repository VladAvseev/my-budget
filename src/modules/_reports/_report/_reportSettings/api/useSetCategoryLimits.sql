-- Замена лимитов категорий отчёта (удаление + вставка в одной транзакции).
-- p_limits — jsonb-массив объектов вида {"categoryId": uuid, "amount": number}.
create or replace function public.set_category_limits(p_report_id uuid, p_limits jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  item jsonb;
  result jsonb;
begin
  delete from public.category_limits
  where report_id = p_report_id;

  if jsonb_array_length(coalesce(p_limits, '[]'::jsonb)) = 0 then
    return '[]'::jsonb;
  end if;

  for item in select * from jsonb_array_elements(p_limits)
  loop
    insert into public.category_limits (report_id, category_id, user_id, amount)
    values (
      p_report_id,
      (item->>'categoryId')::uuid,
      auth.uid(),
      (item->>'amount')::numeric
    );
  end loop;

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