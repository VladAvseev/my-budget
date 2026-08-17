-- 1. Получение новости для админ-панели.
--    SECURITY DEFINER — обходит RLS, поэтому доступ явно проверяется через is_admin().
create or replace function public.admin_get_news()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Доступ запрещён';
  end if;

  select jsonb_build_object('id', n.id, 'text', n.text)
  into result
  from public.news n
  order by n.id
  limit 1;

  return result;
end;
$$;

-- 2. Обновление текста новости. Если записи ещё нет — создаёт её.
create or replace function public.admin_update_news(p_text text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Доступ запрещён';
  end if;

  update public.news set text = p_text where true;
  if not found then
    insert into public.news (text) values (p_text);
  end if;
end;
$$;

-- 3. Показ/скрытие новости для всех пользователей.
create or replace function public.admin_set_show_news(p_show boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Доступ запрещён';
  end if;

  update public.profiles set show_news = p_show where true;
end;
$$;

-- Функции могут вызывать только авторизованные пользователи.
revoke all on function public.admin_get_news() from public;
revoke all on function public.admin_get_news() from anon;
grant execute on function public.admin_get_news() to authenticated;

revoke all on function public.admin_update_news(text) from public;
revoke all on function public.admin_update_news(text) from anon;
grant execute on function public.admin_update_news(text) to authenticated;

revoke all on function public.admin_set_show_news(boolean) from public;
revoke all on function public.admin_set_show_news(boolean) from anon;
grant execute on function public.admin_set_show_news(boolean) to authenticated;