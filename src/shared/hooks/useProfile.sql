-- Создание профиля при первом обращении (или получение существующего).
-- SECURITY INVOKER + auth.uid(): работает в контексте пользователя (RLS-политики).
create or replace function public.get_or_create_profile(p_email text)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  insert into public.profiles (user_id, email)
  values (auth.uid(), p_email)
  on conflict (user_id) do nothing;

  select jsonb_build_object(
    'user_id', user_id,
    'email', email,
    'start_balance', start_balance,
    'onboarded', onboarded,
    'show_news', show_news,
    'role', role,
    'last_active_at', last_active_at,
    'created_at', created_at,
    'updated_at', updated_at
  )
  into result
  from public.profiles
  where user_id = auth.uid();

  return result;
end;
$$;