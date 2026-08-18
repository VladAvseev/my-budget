-- Триггер-функция активности пользователя (триггер trg_operations_last_active на operations).
-- SECURITY DEFINER + set search_path: запись в public.profiles выполняется от владельца
-- функции и не попадает в рекурсию RLS. Тело сохранено как в исходной версии.
create or replace function public.update_last_active()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update profiles
  set last_active_at = now()
  where user_id = new.user_id
    and (last_active_at is null
      or last_active_at < now() - interval '15 minutes');
  return new;
end;
$$;