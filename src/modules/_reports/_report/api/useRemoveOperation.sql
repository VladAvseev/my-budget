-- Удаление операции.
create or replace function public.delete_operation(p_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  delete from public.operations where id = p_id;
$$;