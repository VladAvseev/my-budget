-- Все новости (для главной страницы).
drop function if exists public.get_latest_news();

create or replace function public.get_latest_news()
returns setof jsonb
language sql
security invoker
set search_path = public
as $$
  select jsonb_build_object('id', id, 'text', text, 'created_at', created_at)
  from public.news
  order by created_at desc;
$$;
