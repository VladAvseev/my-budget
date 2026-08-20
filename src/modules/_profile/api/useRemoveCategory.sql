-- Удаление категории.
create or replace function public.delete_category(p_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  delete from public.categories where id = p_id;
$$;