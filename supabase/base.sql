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