-- Создание накопления текущим пользователем.
create or replace function public.create_accumulation(
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
  insert into public.accumulations (user_id, category_id, description, amount)
  values (auth.uid(), p_category_id, p_description, p_amount)
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