-- Текущая новость (одна последняя).
create or replace function public.get_latest_news()
returns jsonb
language sql
security invoker
set search_path = public
as $$
  select jsonb_build_object('id', id, 'text', text)
  from public.news
  order by id
  limit 1;
$$;