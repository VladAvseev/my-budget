-- Создание категории текущим пользователем.
create or replace function public.create_category(p_type text, p_name text, p_color text)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  insert into public.categories (user_id, type, name, color)
  values (auth.uid(), p_type, p_name, p_color)
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