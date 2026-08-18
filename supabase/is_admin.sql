-- Проверка прав администратора.
-- SECURITY DEFINER: внутренний SELECT из public.profiles выполняется от владельца
-- функции и НЕ триггерит RLS. Без этого вызов is_admin() из RLS-политик на тех же
-- таблицах приводил к бесконечной рекурсии ("stack depth limit exceeded") и HTTP 500.
-- set search_path обязателен для SECURITY DEFINER.
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

-- Функцию могут вызывать только авторизованные пользователи.
revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;
