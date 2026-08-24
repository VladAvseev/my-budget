-- Админ: новости — список, создание, редактирование, удаление, управление показом.

-- Удаляем старую функцию (изменился тип возврата)
drop function if exists public.admin_get_news();
-- Удаляем старую перегрузку (изменились аргументы)
drop function if exists public.admin_update_news(text);

-- Список всех новостей (admin)
create or replace function public.admin_get_news_list()
returns setof jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Доступ запрещён';
  end if;

  return query
    select jsonb_build_object('id', n.id, 'text', n.text, 'created_at', n.created_at)
    from public.news n
    order by n.created_at desc;
end;
$$;

-- Создание новости (admin)
create or replace function public.admin_create_news(p_text text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  new_row public.news%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Доступ запрещён';
  end if;

  insert into public.news (text) values (p_text) returning * into new_row;

  return jsonb_build_object('id', new_row.id, 'text', new_row.text, 'created_at', new_row.created_at);
end;
$$;

-- Обновление новости (admin)
create or replace function public.admin_update_news(p_id bigint, p_text text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Доступ запрещён';
  end if;

  update public.news set text = p_text where id = p_id;
end;
$$;

-- Удаление новости (admin)
create or replace function public.admin_delete_news(p_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Доступ запрещён';
  end if;

  delete from public.news where id = p_id;
end;
$$;

-- Управление показом новостей (admin)
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
