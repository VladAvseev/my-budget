-- Создание цели накопления для своей savings-категории текущим пользователем.
create or replace function public.create_goal(
  p_category_id uuid,
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
  if not exists (
    select 1 from public.categories
    where id = p_category_id
      and user_id = auth.uid()
      and type = 'savings'
  ) then
    raise exception 'Категория не найдена среди категорий накоплений';
  end if;

  insert into public.goals (user_id, category_id, amount)
  values (auth.uid(), p_category_id, p_amount)
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
