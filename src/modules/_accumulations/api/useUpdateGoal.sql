-- Обновление суммы цели накопления.
create or replace function public.update_goal(
  p_id uuid,
  p_amount numeric
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  update public.goals
  set amount = p_amount,
      updated_at = now()
  where id = p_id
  returning jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'category_id', category_id,
    'amount', amount,
    'created_at', created_at,
    'updated_at', updated_at
  ) into result;

  return result;
end;
$$;
