-- Цели накоплений пользователя.
create or replace function public.get_goals(p_user_id uuid)
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
    'user_id', user_id,
    'category_id', category_id,
    'amount', amount,
    'created_at', created_at,
    'updated_at', updated_at
  ) order by created_at desc), '[]'::jsonb)
  into result
  from public.goals
  where user_id = p_user_id;

  return result;
end;
$$;
