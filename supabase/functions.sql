-- Функции БД (инвентаризация по pg_get_functiondef).
-- Все функции — SECURITY DEFINER (обходят RLS) и проверяют права через is_admin(),
-- поэтому гранты на них ограничены ролью authenticated (см. grants.sql).

-- ── Проверка прав администратора ────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- ── Триггер на auth.users: создание профиля при регистрации ─────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, created_at)
  values (new.id, new.email, now());
  return new;
end;
$$;

-- ── Триггер на operations: обновление last_active_at (не чаще 15 минут) ─────
create or replace function public.update_last_active()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update profiles
  set last_active_at = now()
  where user_id = new.user_id
    and (last_active_at is null
      or last_active_at < now() - interval '15 minutes');
  return new;
end;
$$;

-- ── Админ: пользователи и статистика ────────────────────────────────────────
create or replace function public.admin_get_users()
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

  select jsonb_agg(jsonb_build_object(
    'user_id', p.user_id,
    'email', p.email,
    'last_active_at', p.last_active_at,
    'onboarded', p.onboarded,
    'sawNews', not p.show_news,
    'reportsCount', coalesce(r.cnt, 0),
    'operationsCount', coalesce(o.cnt, 0),
    'categoriesCount', coalesce(c.cnt, 0),
    'incomeCount', coalesce(o.income_cnt, 0),
    'dailyCount', coalesce(o.daily_cnt, 0),
    'expenseCount', coalesce(o.expense_cnt, 0),
    'savingsCount', coalesce(o.savings_cnt, 0),
    'accumulationsCount', coalesce(a.cnt, 0)
  ))
  into result
  from public.profiles p
  left join (
    select user_id, count(*) as cnt
    from public.reports
    group by user_id
  ) r on r.user_id = p.user_id
  left join (
    select
      user_id,
      count(*) as cnt,
      count(*) filter (where type = 'income') as income_cnt,
      count(*) filter (where type = 'daily') as daily_cnt,
      count(*) filter (where type = 'expense') as expense_cnt,
      count(*) filter (where type in ('savings', 'savings_out')) as savings_cnt
    from public.operations
    group by user_id
  ) o on o.user_id = p.user_id
  left join (
    select user_id, count(*) as cnt
    from public.categories
    group by user_id
  ) c on c.user_id = p.user_id
  left join (
    select user_id, count(*) as cnt
    from public.accumulations
    group by user_id
  ) a on a.user_id = p.user_id;

  return coalesce(result, '[]'::jsonb);
end;
$$;

create or replace function public.admin_get_dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Доступ запрещён';
  end if;

  return jsonb_build_object(
    'users', (
      select jsonb_build_object(
        'total', count(*),
        'withoutReports', count(*) filter (
          where not exists (
            select 1 from public.reports r where r.user_id = p.user_id
          )
        ),
        'onboarded', count(*) filter (where p.onboarded),
        'sawNews', count(*) filter (where not p.show_news)
      )
      from public.profiles p
    ),
    'activity', (
      select jsonb_build_object(
        'dau', count(*) filter (where p.last_active_at >= now() - interval '1 day'),
        'wau', count(*) filter (where p.last_active_at >= now() - interval '7 days'),
        'mau', count(*) filter (where p.last_active_at >= now() - interval '30 days'),
        'qau', count(*) filter (where p.last_active_at >= now() - interval '90 days'),
        'sau', count(*) filter (where p.last_active_at >= now() - interval '180 days'),
        'yau', count(*) filter (where p.last_active_at >= now() - interval '365 days')
      )
      from public.profiles p
    ),
    'churn', (
      select jsonb_build_object(
        'inactive1d', count(*) filter (
          where p.last_active_at is null or p.last_active_at < now() - interval '1 day'
        ),
        'inactive7d', count(*) filter (
          where p.last_active_at is null or p.last_active_at < now() - interval '7 days'
        ),
        'inactive30d', count(*) filter (
          where p.last_active_at is null or p.last_active_at < now() - interval '30 days'
        ),
        'inactive90d', count(*) filter (
          where p.last_active_at is null or p.last_active_at < now() - interval '90 days'
        ),
        'inactive180d', count(*) filter (
          where p.last_active_at is null or p.last_active_at < now() - interval '180 days'
        ),
        'inactive365d', count(*) filter (
          where p.last_active_at is null or p.last_active_at < now() - interval '365 days'
        )
      )
      from public.profiles p
    ),
    'reports', (
      select jsonb_build_object(
        'total', count(*),
        'withDailyExpenses', count(*) filter (where r.has_daily_expenses)
      )
      from public.reports r
    ),
    'operations', (
      select jsonb_build_object(
        'total', count(*),
        'income', count(*) filter (where o.type = 'income'),
        'expense', count(*) filter (where o.type = 'expense'),
        'daily', count(*) filter (where o.type = 'daily'),
        'savings', count(*) filter (where o.type in ('savings', 'savings_out'))
      )
      from public.operations o
    )
  );
end;
$$;

-- ── Админ: новости ──────────────────────────────────────────────────────────
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

-- ── Админ: поддержка ────────────────────────────────────────────────────────
create or replace function public.admin_get_support_chats()
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

  select coalesce(jsonb_agg(row order by row->>'lastAt' desc nulls last), '[]'::jsonb)
  into result
  from (
    select jsonb_build_object(
      'user_id', c.user_id,
      'email', p.email,
      'isOpen', c.is_open,
      'unreadCount', coalesce((
        select count(*)
        from public.support_messages m
        where m.user_id = c.user_id
          and m.author_role = 'user'
          and (c.admin_read_at is null or m.created_at > c.admin_read_at)
      ), 0),
      'lastText', (
        select m.text
        from public.support_messages m
        where m.user_id = c.user_id
        order by m.created_at desc
        limit 1
      ),
      'lastAt', (
        select m.created_at::text
        from public.support_messages m
        where m.user_id = c.user_id
        order by m.created_at desc
        limit 1
      )
    ) as row
    from public.support_chats c
    join public.profiles p on p.user_id = c.user_id
    where exists (
      select 1 from public.support_messages m where m.user_id = c.user_id
    )
  ) t;

  return result;
end;
$$;

create or replace function public.admin_get_support_chat(p_user_id uuid)
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

  if not exists (select 1 from public.support_chats c where c.user_id = p_user_id) then
    return null;
  end if;

  update public.support_chats
  set admin_read_at = now(), updated_at = now()
  where user_id = p_user_id;

  select jsonb_build_object(
    'messages', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.id,
        'user_id', m.user_id,
        'author_role', m.author_role,
        'text', m.text,
        'created_at', m.created_at
      ) order by m.created_at)
      from public.support_messages m
      where m.user_id = p_user_id
    ), '[]'::jsonb),
    'isOpen', c.is_open
  )
  into result
  from public.support_chats c
  where c.user_id = p_user_id;

  return result;
end;
$$;

create or replace function public.admin_send_support_message(p_user_id uuid, p_text text)
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

  if not exists (select 1 from public.support_chats c where c.user_id = p_user_id) then
    raise exception 'Чат не найден';
  end if;

  insert into public.support_messages (user_id, author_role, text)
  values (p_user_id, 'admin', p_text)
  returning jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'author_role', author_role,
    'text', text,
    'created_at', created_at
  ) into result;

  update public.support_chats
  set admin_read_at = now(), updated_at = now()
  where user_id = p_user_id;

  return result;
end;
$$;

create or replace function public.admin_set_support_open(p_user_id uuid, p_open boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Доступ запрещён';
  end if;

  update public.support_chats
  set is_open = p_open, updated_at = now()
  where user_id = p_user_id;
end;
$$;

create or replace function public.admin_clear_support_chat(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Доступ запрещён';
  end if;

  delete from public.support_messages where user_id = p_user_id;
  delete from public.support_chats where user_id = p_user_id;
end;
$$;

create or replace function public.admin_get_support_open_count()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  result bigint;
begin
  if not public.is_admin() then
    raise exception 'Доступ запрещён';
  end if;

  select count(*) into result from public.support_chats where is_open;
  return result;
end;
$$;

-- ── Админ: заполненность базы данных ────────────────────────────────────────
create or replace function public.admin_get_database_size()
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

select jsonb_build_object(
    'sizeBytes', coalesce(sum(pg_database_size(datname)), 0),
    'sizePretty', pg_size_pretty(coalesce(sum(pg_database_size(datname)), 0))
  ) into result
  from pg_database;
  return result;
end;
$$;

-- ── Админ: статус обращений в поддержку ─────────────────────────────────────
create or replace function public.admin_get_support_status()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
  open_count bigint;
  unanswered_count bigint;
  avg_hours numeric;
begin
  if not public.is_admin() then
    raise exception 'Доступ запрещён';
  end if;

  select count(*) into open_count
  from public.support_chats
  where is_open;

  select count(*) into unanswered_count
  from public.support_chats c
  left join lateral (
    select max(m.created_at) as last_admin_at
    from public.support_messages m
    where m.user_id = c.user_id
      and m.author_role = 'admin'
  ) a on true
  where c.is_open
    and (a.last_admin_at is null or a.last_admin_at < now() - interval '1 day');

  select round(avg(extract(epoch from (r.created_at - q.created_at)) / 3600.0), 1)
  into avg_hours
  from public.support_messages q
  join lateral (
    select min(m.created_at) as created_at
    from public.support_messages m
    where m.user_id = q.user_id
      and m.author_role = 'admin'
      and m.created_at > q.created_at
  ) r on true
  where q.author_role = 'user';

  select jsonb_build_object(
    'open', open_count,
    'unanswered', unanswered_count,
    'avgResponseHours', avg_hours
  ) into result;
  return result;
end;
$$;