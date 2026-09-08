-- Админ: рост количества операций (только даты создания).
create or replace function public.admin_get_operations_dynamics()
returns table (created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select o.created_at
  from public.operations o
  order by o.created_at asc;
$$;
