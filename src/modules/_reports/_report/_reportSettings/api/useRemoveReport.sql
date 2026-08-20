-- Удаление отчёта.
create or replace function public.delete_report(p_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  delete from public.reports where id = p_id;
$$;