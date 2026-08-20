-- Сводка операций пользователя по всем отчётам (для баланса).
create or replace function public.get_user_summary(p_user_id uuid)
returns jsonb
language sql
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'income', coalesce(sum(amount::numeric) filter (where type = 'income'), 0),
    'expense', coalesce(sum(amount::numeric) filter (where type = 'expense'), 0),
    'savings', coalesce(sum(amount::numeric) filter (where type = 'savings'), 0)
      - coalesce(sum(amount::numeric) filter (where type = 'savings_out'), 0),
    'daily', coalesce(sum(amount::numeric) filter (where type = 'daily'), 0)
  )
  from public.operations
  where user_id = p_user_id;
$$;