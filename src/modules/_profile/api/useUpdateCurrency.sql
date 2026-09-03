-- Обновление валюты профиля.
-- SECURITY INVOKER + auth.uid(): работает в контексте пользователя (RLS-политики).
create or replace function public.update_currency(p_currency text)
returns void
language sql
security invoker
set search_path = public
as $$
  update public.profiles
  set currency = p_currency
  where user_id = auth.uid();
$$;
