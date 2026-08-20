-- Обновление категории.
create or replace function public.update_category(p_id uuid, p_name text, p_color text)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  update public.categories
  set name = p_name,
      color = p_color,
      updated_at = now()
  where id = p_id
  returning jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'type', type,
    'name', name,
    'color', color,
    'created_at', created_at,
    'updated_at', updated_at
  ) into result;

  return result;
end;
$$;