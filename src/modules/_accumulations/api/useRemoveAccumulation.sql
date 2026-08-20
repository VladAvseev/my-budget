-- Удаление накопления.
create or replace function public.delete_accumulation(p_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  delete from public.accumulations where id = p_id;
$$;