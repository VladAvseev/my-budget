-- Счётчики для онбординга: категории, отчёты, операции пользователя.
create or replace function public.get_onboarding_state(p_user_id uuid)
returns jsonb
language sql
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'categories', (select count(*) from public.categories where user_id = p_user_id),
    'reports', (select count(*) from public.reports where user_id = p_user_id),
    'operations', (select count(*) from public.operations where user_id = p_user_id)
  );
$$;