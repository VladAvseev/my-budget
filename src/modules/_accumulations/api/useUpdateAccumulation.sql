-- Обновление накопления.
create or replace function public.update_accumulation(
  p_id uuid,
  p_amount numeric,
  p_description text,
  p_category_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  update public.accumulations
  set amount = p_amount,
      description = p_description,
      category_id = p_category_id,
      updated_at = now()
  where id = p_id
  returning jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'category_id', category_id,
    'description', description,
    'amount', amount,
    'created_at', created_at,
    'updated_at', updated_at
  ) into result;

  return result;
end;
$$;