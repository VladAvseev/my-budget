-- Обновление начального баланса текущего пользователя.
create or replace function public.update_start_balance(p_amount numeric)
returns void
language sql
security invoker
set search_path = public
as $$
  update public.profiles
  set start_balance = p_amount
  where user_id = auth.uid();
$$;