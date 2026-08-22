-- Удаление цели накопления.
create or replace function public.delete_goal(p_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  delete from public.goals where id = p_id;
$$;
