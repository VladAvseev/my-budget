-- Скрыть новость для текущего пользователя.
create or replace function public.hide_news()
returns void
language sql
security invoker
set search_path = public
as $$
  update public.profiles
  set show_news = false
  where user_id = auth.uid();
$$;