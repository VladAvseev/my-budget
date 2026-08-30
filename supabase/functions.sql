-- Собранный файл функций БД. Генерируется скриптом: npm run sql:collect.
-- Не редактировать вручную — изменения вносятся в .sql рядом с хуками и в supabase/base.sql.

-- ── Инфраструктура (supabase/base.sql) ────────────────────────────────────

-- Инфраструктурные функции БД: проверка прав, триггеры.
-- Собираются в единый functions.sql скриптом sql:collect (см. scripts/sql-collect.mjs).

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

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_accumulations/api/useCategories.sql
-- Категории пользователя (опционально по типу), старые сверху.
create or replace function public.get_categories(p_user_id uuid, p_type text)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'type', type,
    'name', name,
    'color', color,
    'created_at', created_at,
    'updated_at', updated_at
  ) order by created_at), '[]'::jsonb)
  into result
  from public.categories
  where user_id = p_user_id
    and (p_type is null or type = p_type);

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_accumulations/api/useCreateAccumulation.sql
-- Создание накопления текущим пользователем.
create or replace function public.create_accumulation(
  p_amount numeric,
  p_description text,
  p_category_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  insert into public.accumulations (user_id, category_id, description, amount)
  values (auth.uid(), p_category_id, p_description, p_amount)
  returning jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'category_id', category_id,
    'description', description,
    'amount', amount,
    'created_at', created_at,
    'updated_at', updated_at
  ) into result;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_accumulations/api/useCreateGoal.sql
-- Создание цели накопления для своей savings-категории текущим пользователем.
create or replace function public.create_goal(
  p_category_id uuid,
  p_amount numeric
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  if not exists (
    select 1 from public.categories
    where id = p_category_id
      and user_id = auth.uid()
      and type = 'savings'
  ) then
    raise exception 'Категория не найдена среди категорий накоплений';
  end if;

  insert into public.goals (user_id, category_id, amount)
  values (auth.uid(), p_category_id, p_amount)
  returning jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'category_id', category_id,
    'amount', amount,
    'created_at', created_at,
    'updated_at', updated_at
  ) into result;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_accumulations/api/useRemoveAccumulation.sql
-- Удаление накопления.
create or replace function public.delete_accumulation(p_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  delete from public.accumulations where id = p_id;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_accumulations/api/useRemoveGoal.sql
-- Удаление цели накопления.
create or replace function public.delete_goal(p_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  delete from public.goals where id = p_id;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_accumulations/api/useSavingsOperations.sql
-- Операции накоплений пользователя (вклад + снятие) с данными отчёта.
create or replace function public.get_savings_operations(p_user_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(row order by row->>'reportCreatedAt' desc, row->>'created_at' desc), '[]'::jsonb)
  into result
  from (
    select jsonb_build_object(
      'id', o.id,
      'report_id', o.report_id,
      'user_id', o.user_id,
      'type', o.type,
      'amount', o.amount,
      'category_id', o.category_id,
      'description', o.description,
      'date', o.date,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'reportName', r.name,
      'reportCreatedAt', r.created_at
    ) as row
    from public.operations o
    join public.reports r on r.id = o.report_id
    where o.user_id = p_user_id
      and o.type in ('savings', 'savings_out')
  ) t;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_accumulations/api/useUpdateAccumulation.sql
-- Обновление накопления.
create or replace function public.update_accumulation(
  p_id uuid,
  p_amount numeric,
  p_description text,
  p_category_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  update public.accumulations
  set amount = p_amount,
      description = p_description,
      category_id = p_category_id,
      updated_at = now()
  where id = p_id
  returning jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'category_id', category_id,
    'description', description,
    'amount', amount,
    'created_at', created_at,
    'updated_at', updated_at
  ) into result;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_accumulations/api/useUpdateGoal.sql
-- Обновление суммы цели накопления.
create or replace function public.update_goal(
  p_id uuid,
  p_amount numeric
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  update public.goals
  set amount = p_amount,
      updated_at = now()
  where id = p_id
  returning jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'category_id', category_id,
    'amount', amount,
    'created_at', created_at,
    'updated_at', updated_at
  ) into result;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_admin/_dashboard/api/useAdminDatabaseSize.sql
-- Админ: размер базы данных.
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

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_admin/_dashboard/api/useAdminStats.sql
-- Админ: статистика дашборда.
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

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_admin/_news/api/useAdminNews.sql
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

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_admin/_support/api/useAdminClearChat.sql
-- Админ: очистка чата поддержки.
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

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_admin/_support/api/useAdminSendMessage.sql
-- Админ: ответ в чат поддержки.
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

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_admin/_support/api/useAdminSetOpen.sql
-- Админ: открыть/закрыть чат поддержки.
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

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_admin/_support/api/useAdminSupportChat.sql
-- Админ: сообщения и статус чата пользователя (помечает чат прочитанным).
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

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_admin/_support/api/useAdminSupportChats.sql
-- Админ: список чатов поддержки.
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

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_admin/_support/api/useAdminSupportOpenCount.sql
-- Админ: количество открытых чатов.
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

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_admin/_users/api/useAdminUsers.sql
-- Админ: список пользователей со статистикой.
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

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_home/api/useCategories.sql
-- Категории пользователя (опционально по типу), старые сверху.
create or replace function public.get_categories(p_user_id uuid, p_type text)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'type', type,
    'name', name,
    'color', color,
    'created_at', created_at,
    'updated_at', updated_at
  ) order by created_at), '[]'::jsonb)
  into result
  from public.categories
  where user_id = p_user_id
    and (p_type is null or type = p_type);

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_home/api/useCompleteOnboarding.sql
-- Завершение онбординга текущим пользователем.
create or replace function public.complete_onboarding()
returns void
language sql
security invoker
set search_path = public
as $$
  update public.profiles
  set onboarded = true
  where user_id = auth.uid();
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_home/api/useHideNews.sql
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

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_home/api/useNews.sql
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

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_home/api/useOnboardingChecklist.sql
-- Счётчики для онбординга: категории, отчёты, операции пользователя.
create or replace function public.get_onboarding_state(p_user_id uuid)
returns jsonb
language sql
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'categories', (select count(*) from public.categories where user_id = p_user_id),
    'reports', (select count(*) from public.reports where user_id = p_user_id),
    'operations', (select count(*) from public.operations where user_id = p_user_id)
  );
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_home/api/useReports.sql
-- Отчёты текущего пользователя (новые сверху).
create or replace function public.get_reports()
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'name', name,
    'has_daily_expenses', has_daily_expenses,
    'daily_budget', daily_budget,
    'period_start', period_start,
    'period_end', period_end,
    'created_at', created_at,
    'updated_at', updated_at
  ) order by created_at desc), '[]'::jsonb)
  into result
  from public.reports
  where user_id = auth.uid();

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_home/api/useSavingsOperations.sql
-- Операции накоплений пользователя (вклад + снятие) с данными отчёта.
create or replace function public.get_savings_operations(p_user_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(row order by row->>'reportCreatedAt' desc, row->>'created_at' desc), '[]'::jsonb)
  into result
  from (
    select jsonb_build_object(
      'id', o.id,
      'report_id', o.report_id,
      'user_id', o.user_id,
      'type', o.type,
      'amount', o.amount,
      'category_id', o.category_id,
      'description', o.description,
      'date', o.date,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'reportName', r.name,
      'reportCreatedAt', r.created_at
    ) as row
    from public.operations o
    join public.reports r on r.id = o.report_id
    where o.user_id = p_user_id
      and o.type in ('savings', 'savings_out')
  ) t;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_home/api/useSummary.sql
-- Сводка операций отчёта по типам.
create or replace function public.get_report_summary(p_report_id uuid)
returns jsonb
language sql
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'income', coalesce(sum(amount::numeric) filter (where type = 'income'), 0),
    'expense', coalesce(sum(amount::numeric) filter (where type = 'expense'), 0),
    'savings', coalesce(sum(amount::numeric) filter (where type = 'savings'), 0)
      - coalesce(sum(amount::numeric) filter (where type = 'savings_out'), 0),
    'daily', coalesce(sum(amount::numeric) filter (where type = 'daily'), 0)
  )
  from public.operations
  where report_id = p_report_id;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_overview/api/useCategories.sql
-- Категории пользователя (опционально по типу), старые сверху.
create or replace function public.get_categories(p_user_id uuid, p_type text)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'type', type,
    'name', name,
    'color', color,
    'created_at', created_at,
    'updated_at', updated_at
  ) order by created_at), '[]'::jsonb)
  into result
  from public.categories
  where user_id = p_user_id
    and (p_type is null or type = p_type);

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_overview/api/useOverviewOperationsMap.sql
-- Операции по нескольким отчётам (только поля для сводки: тип, сумма, категория).
create or replace function public.get_operations_by_reports(p_report_ids uuid[])
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'report_id', report_id,
    'type', type,
    'amount', amount,
    'category_id', category_id
  )), '[]'::jsonb)
  into result
  from public.operations
  where report_id = any(p_report_ids);

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_overview/api/useReports.sql
-- Отчёты текущего пользователя (новые сверху).
create or replace function public.get_reports()
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'name', name,
    'has_daily_expenses', has_daily_expenses,
    'daily_budget', daily_budget,
    'period_start', period_start,
    'period_end', period_end,
    'created_at', created_at,
    'updated_at', updated_at
  ) order by created_at desc), '[]'::jsonb)
  into result
  from public.reports
  where user_id = auth.uid();

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_profile/api/useCategories.sql
-- Категории пользователя (опционально по типу), старые сверху.
create or replace function public.get_categories(p_user_id uuid, p_type text)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'type', type,
    'name', name,
    'color', color,
    'created_at', created_at,
    'updated_at', updated_at
  ) order by created_at), '[]'::jsonb)
  into result
  from public.categories
  where user_id = p_user_id
    and (p_type is null or type = p_type);

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_profile/api/useCreateCategory.sql
-- Создание категории текущим пользователем.
create or replace function public.create_category(p_type text, p_name text, p_color text)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  insert into public.categories (user_id, type, name, color)
  values (auth.uid(), p_type, p_name, p_color)
  returning jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'type', type,
    'name', name,
    'color', color,
    'created_at', created_at,
    'updated_at', updated_at
  ) into result;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_profile/api/useRemoveCategory.sql
-- Удаление категории.
create or replace function public.delete_category(p_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  delete from public.categories where id = p_id;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_profile/api/useUpdateCategory.sql
-- Обновление категории.
create or replace function public.update_category(p_id uuid, p_name text, p_color text)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  update public.categories
  set name = p_name,
      color = p_color,
      updated_at = now()
  where id = p_id
  returning jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'type', type,
    'name', name,
    'color', color,
    'created_at', created_at,
    'updated_at', updated_at
  ) into result;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_profile/api/useUpdateStartBalance.sql
-- Обновление начального баланса текущего пользователя.
create or replace function public.update_start_balance(p_amount numeric)
returns void
language sql
security invoker
set search_path = public
as $$
  update public.profiles
  set start_balance = p_amount
  where user_id = auth.uid();
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_reports/_report/_reportSettings/api/useDisableDailyExpenses.sql
-- Отключение ежедневных расходов: удаление daily-операций и сброс настроек отчёта.
create or replace function public.disable_daily_expenses(p_report_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.operations
  where report_id = p_report_id
    and type = 'daily';

  update public.reports
  set has_daily_expenses = false,
      daily_budget = null,
      period_start = null,
      period_end = null,
      updated_at = now()
  where id = p_report_id;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_reports/_report/_reportSettings/api/useRemoveReport.sql
-- Удаление отчёта.
create or replace function public.delete_report(p_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  delete from public.reports where id = p_id;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_reports/_report/_reportSettings/api/useSetCategoryLimits.sql
-- Замена лимитов категорий отчёта (удаление + вставка в одной транзакции).
-- p_limits — jsonb-массив объектов вида {"categoryId": uuid, "amount": number}.
create or replace function public.set_category_limits(p_report_id uuid, p_limits jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  item jsonb;
  result jsonb;
begin
  delete from public.category_limits
  where report_id = p_report_id;

  if jsonb_array_length(coalesce(p_limits, '[]'::jsonb)) = 0 then
    return '[]'::jsonb;
  end if;

  for item in select * from jsonb_array_elements(p_limits)
  loop
    insert into public.category_limits (report_id, category_id, user_id, amount)
    values (
      p_report_id,
      (item->>'categoryId')::uuid,
      auth.uid(),
      (item->>'amount')::numeric
    );
  end loop;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'report_id', report_id,
    'category_id', category_id,
    'user_id', user_id,
    'amount', amount,
    'created_at', created_at,
    'updated_at', updated_at
  ) order by created_at), '[]'::jsonb)
  into result
  from public.category_limits
  where report_id = p_report_id;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_reports/_report/_reportSettings/api/useUpdateReport.sql
-- Обновление отчёта: либо имя, либо настройки ежедневных расходов.
create or replace function public.update_report(
  p_id uuid,
  p_name text default null,
  p_has_daily_expenses boolean default null,
  p_daily_budget numeric default null,
  p_period_start date default null,
  p_period_end date default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  if p_name is not null then
    update public.reports
    set name = p_name, updated_at = now()
    where id = p_id;
  elsif p_has_daily_expenses is not null then
    if p_has_daily_expenses then
      update public.reports
      set has_daily_expenses = true,
          daily_budget = p_daily_budget,
          period_start = p_period_start,
          period_end = p_period_end,
          updated_at = now()
      where id = p_id;
    else
      update public.reports
      set has_daily_expenses = false,
          daily_budget = null,
          period_start = null,
          period_end = null,
          updated_at = now()
      where id = p_id;
    end if;
  end if;

  select jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'name', name,
    'has_daily_expenses', has_daily_expenses,
    'daily_budget', daily_budget,
    'period_start', period_start,
    'period_end', period_end,
    'created_at', created_at,
    'updated_at', updated_at
  ) into result
  from public.reports
  where id = p_id;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_reports/_report/api/useCategories.sql
-- Категории пользователя (опционально по типу), старые сверху.
create or replace function public.get_categories(p_user_id uuid, p_type text)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'type', type,
    'name', name,
    'color', color,
    'created_at', created_at,
    'updated_at', updated_at
  ) order by created_at), '[]'::jsonb)
  into result
  from public.categories
  where user_id = p_user_id
    and (p_type is null or type = p_type);

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_reports/_report/api/useCategoryLimits.sql
-- Лимиты категорий отчёта (старые сверху).
create or replace function public.get_category_limits(p_report_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'report_id', report_id,
    'category_id', category_id,
    'user_id', user_id,
    'amount', amount,
    'created_at', created_at,
    'updated_at', updated_at
  ) order by created_at), '[]'::jsonb)
  into result
  from public.category_limits
  where report_id = p_report_id;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_reports/_report/api/useCreateDailyExpense.sql
-- Ежедневный расход: находит первую свободную дату в периоде и вставляет операцию.
create or replace function public.create_daily_expense(
  p_report_id uuid,
  p_amount numeric,
  p_description text,
  p_period_start date,
  p_period_end date
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  free_date date;
  result jsonb;
begin
  select d.date::date
  from generate_series(p_period_start, p_period_end, interval '1 day') as d(date)
  where not exists (
    select 1
    from public.operations o
    where o.report_id = p_report_id
      and o.type = 'daily'
      and o.date::date = d.date::date
  )
  order by d.date
  limit 1
  into free_date;

  if free_date is null then
    raise exception 'Нет свободных дат в отчётном периоде';
  end if;

  insert into public.operations (report_id, user_id, type, amount, description, date)
  values (p_report_id, auth.uid(), 'daily', p_amount, p_description, free_date)
  returning jsonb_build_object(
    'id', id,
    'report_id', report_id,
    'user_id', user_id,
    'type', type,
    'amount', amount,
    'category_id', category_id,
    'description', description,
    'date', date,
    'created_at', created_at,
    'updated_at', updated_at
  ) into result;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_reports/_report/api/useCreateOperation.sql
-- Создание операции в отчёте текущим пользователем.
create or replace function public.create_operation(
  p_report_id uuid,
  p_type text,
  p_amount numeric,
  p_category_id uuid,
  p_description text,
  p_date date
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  insert into public.operations (report_id, user_id, type, amount, category_id, description, date)
  values (p_report_id, auth.uid(), p_type, p_amount, p_category_id, p_description, p_date)
  returning jsonb_build_object(
    'id', id,
    'report_id', report_id,
    'user_id', user_id,
    'type', type,
    'amount', amount,
    'category_id', category_id,
    'description', description,
    'date', date,
    'created_at', created_at,
    'updated_at', updated_at
  ) into result;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_reports/_report/api/useOperations.sql
-- Операции отчёта по типу (daily — по дате, остальные — по времени создания).
create or replace function public.get_operations_by_report(p_report_id uuid, p_type text)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'report_id', report_id,
    'user_id', user_id,
    'type', type,
    'amount', amount,
    'category_id', category_id,
    'description', description,
    'date', date,
    'created_at', created_at,
    'updated_at', updated_at
  ) order by
    (case when p_type = 'daily' then date else null end) desc nulls last,
    created_at desc), '[]'::jsonb)
  into result
  from public.operations
  where report_id = p_report_id
    and type = p_type;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_reports/_report/api/useRemoveOperation.sql
-- Удаление операции.
create or replace function public.delete_operation(p_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  delete from public.operations where id = p_id;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_reports/_report/api/useReport.sql
-- Отчёт по id.
create or replace function public.get_report(p_report_id uuid)
returns jsonb
language sql
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'name', name,
    'has_daily_expenses', has_daily_expenses,
    'daily_budget', daily_budget,
    'period_start', period_start,
    'period_end', period_end,
    'created_at', created_at,
    'updated_at', updated_at
  )
  from public.reports
  where id = p_report_id;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_reports/_report/api/useSummary.sql
-- Сводка операций отчёта по типам.
create or replace function public.get_report_summary(p_report_id uuid)
returns jsonb
language sql
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'income', coalesce(sum(amount::numeric) filter (where type = 'income'), 0),
    'expense', coalesce(sum(amount::numeric) filter (where type = 'expense'), 0),
    'savings', coalesce(sum(amount::numeric) filter (where type = 'savings'), 0)
      - coalesce(sum(amount::numeric) filter (where type = 'savings_out'), 0),
    'daily', coalesce(sum(amount::numeric) filter (where type = 'daily'), 0)
  )
  from public.operations
  where report_id = p_report_id;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_reports/_report/api/useUpdateOperation.sql
-- Обновление операции. Тип и дата обновляются только если переданы.
create or replace function public.update_operation(
  p_id uuid,
  p_amount numeric,
  p_category_id uuid,
  p_description text,
  p_type text default null,
  p_date date default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  update public.operations o
  set amount = p_amount,
      category_id = p_category_id,
      description = p_description,
      type = coalesce(p_type, o.type),
      date = coalesce(p_date::text, o.date),
      updated_at = now()
  where o.id = p_id
  returning jsonb_build_object(
    'id', id,
    'report_id', report_id,
    'user_id', user_id,
    'type', type,
    'amount', amount,
    'category_id', category_id,
    'description', description,
    'date', date,
    'created_at', created_at,
    'updated_at', updated_at
  ) into result;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_reports/api/useCreateReport.sql
-- Создание отчёта текущим пользователем.
create or replace function public.create_report(
  p_name text,
  p_has_daily_expenses boolean,
  p_daily_budget numeric,
  p_period_start date,
  p_period_end date
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  insert into public.reports (user_id, name, has_daily_expenses, daily_budget, period_start, period_end)
  values (
    auth.uid(),
    p_name,
    coalesce(p_has_daily_expenses, false),
    case when coalesce(p_has_daily_expenses, false) then p_daily_budget else null end,
    case when coalesce(p_has_daily_expenses, false) then p_period_start else null end,
    case when coalesce(p_has_daily_expenses, false) then p_period_end else null end
  )
  returning jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'name', name,
    'has_daily_expenses', has_daily_expenses,
    'daily_budget', daily_budget,
    'period_start', period_start,
    'period_end', period_end,
    'created_at', created_at,
    'updated_at', updated_at
  ) into result;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_reports/api/useReports.sql
-- Отчёты текущего пользователя (новые сверху).
create or replace function public.get_reports()
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'name', name,
    'has_daily_expenses', has_daily_expenses,
    'daily_budget', daily_budget,
    'period_start', period_start,
    'period_end', period_end,
    'created_at', created_at,
    'updated_at', updated_at
  ) order by created_at desc), '[]'::jsonb)
  into result
  from public.reports
  where user_id = auth.uid();

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_support/api/useMarkSupportRead.sql
-- Отметить чат прочитанным (по последнему сообщению админа).
create or replace function public.mark_support_read()
returns void
language plpgsql
security invoker
set search_path = public
as $$
<<fn>>
declare
  last_admin_at timestamptz;
  user_read_at timestamptz;
begin
  select max(created_at) into last_admin_at
  from public.support_messages
  where user_id = auth.uid()
    and author_role = 'admin';

  user_read_at := greatest(coalesce(last_admin_at, now()), now());

  update public.support_chats
  set user_read_at = fn.user_read_at, updated_at = now()
  where user_id = auth.uid();
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_support/api/useSendSupportMessage.sql
-- Отправка сообщения в поддержку: открытие/создание чата и вставка сообщения.
create or replace function public.send_support_message(p_text text)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  now_ts timestamptz := now();
  result jsonb;
begin
  insert into public.support_chats (user_id, is_open, updated_at)
  values (auth.uid(), true, now_ts)
  on conflict (user_id) do update set is_open = true, updated_at = now_ts;

  insert into public.support_messages (user_id, author_role, text)
  values (auth.uid(), 'user', p_text)
  returning jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'author_role', author_role,
    'text', text,
    'created_at', created_at
  ) into result;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_support/api/useSupportChat.sql
-- Чат поддержки пользователя: сообщения, статус и количество непрочитанных.
create or replace function public.get_support_chat(p_user_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  chat public.support_chats%rowtype;
  unread bigint;
begin
  select * into chat from public.support_chats where user_id = p_user_id;

  select count(*) into unread
  from public.support_messages m
  where m.user_id = p_user_id
    and m.author_role = 'admin'
    and (chat.user_read_at is null or m.created_at > chat.user_read_at);

  return jsonb_build_object(
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
    'isOpen', coalesce(chat.is_open, false),
    'userReadAt', chat.user_read_at,
    'unreadCount', unread,
    'chatExists', chat.user_id is not null
  );
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/modules/_support/api/useSupportUnread.sql
-- Количество непрочитанных сообщений админа в чате пользователя.
create or replace function public.get_support_unread_count(p_user_id uuid)
returns bigint
language plpgsql
security invoker
set search_path = public
as $$
declare
  user_read_at timestamptz;
  result bigint;
begin
  select c.user_read_at into user_read_at
  from public.support_chats c
  where c.user_id = p_user_id;

  select count(*) into result
  from public.support_messages m
  where m.user_id = p_user_id
    and m.author_role = 'admin'
    and (user_read_at is null or m.created_at > user_read_at);

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/shared/hooks/useAccumulations.sql
-- Накопления пользователя (последние сверху).
create or replace function public.get_accumulations(p_user_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'category_id', category_id,
    'description', description,
    'amount', amount,
    'created_at', created_at,
    'updated_at', updated_at
  ) order by created_at desc), '[]'::jsonb)
  into result
  from public.accumulations
  where user_id = p_user_id;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/shared/hooks/useGlobalBalance.sql
-- Сводка операций пользователя по всем отчётам (для баланса).
create or replace function public.get_user_summary(p_user_id uuid)
returns jsonb
language sql
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'income', coalesce(sum(amount::numeric) filter (where type = 'income'), 0),
    'expense', coalesce(sum(amount::numeric) filter (where type = 'expense'), 0),
    'savings', coalesce(sum(amount::numeric) filter (where type = 'savings'), 0)
      - coalesce(sum(amount::numeric) filter (where type = 'savings_out'), 0),
    'daily', coalesce(sum(amount::numeric) filter (where type = 'daily'), 0)
  )
  from public.operations
  where user_id = p_user_id;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/shared/hooks/useGoals.sql
-- Цели накоплений пользователя.
create or replace function public.get_goals(p_user_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'category_id', category_id,
    'amount', amount,
    'created_at', created_at,
    'updated_at', updated_at
  ) order by created_at desc), '[]'::jsonb)
  into result
  from public.goals
  where user_id = p_user_id;

  return result;
end;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Источник: src/shared/hooks/useProfile.sql
-- Создание профиля при первом обращении (или получение существующего).
-- SECURITY INVOKER + auth.uid(): работает в контексте пользователя (RLS-политики).
create or replace function public.get_or_create_profile(p_email text)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  insert into public.profiles (user_id, email)
  values (auth.uid(), p_email)
  on conflict (user_id) do nothing;

  select jsonb_build_object(
    'user_id', user_id,
    'email', email,
    'start_balance', start_balance,
    'onboarded', onboarded,
    'show_news', show_news,
    'role', role,
    'last_active_at', last_active_at,
    'created_at', created_at,
    'updated_at', updated_at
  )
  into result
  from public.profiles
  where user_id = auth.uid();

  return result;
end;
$$;
