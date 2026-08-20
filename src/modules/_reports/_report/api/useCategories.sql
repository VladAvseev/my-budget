-- Категории пользователя (опционально по типу), старые сверху.
create or replace function public.get_categories(p_user_id uuid, p_type text)
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
    'type', type,
    'name', name,
    'color', color,
    'created_at', created_at,
    'updated_at', updated_at
  ) order by created_at), '[]'::jsonb)
  into result
  from public.categories
  where user_id = p_user_id
    and (p_type is null or type = p_type);

  return result;
end;
$$;