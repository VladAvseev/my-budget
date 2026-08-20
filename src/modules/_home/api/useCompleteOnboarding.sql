-- Завершение онбординга текущим пользователем.
create or replace function public.complete_onboarding()
returns void
language sql
security invoker
set search_path = public
as $$
  update public.profiles
  set onboarded = true
  where user_id = auth.uid();
$$;