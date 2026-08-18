-- Гранты (инвентаризация по information_schema.routine_privileges).
-- Админ-функции и is_admin(): EXECUTE только для authenticated
-- (PUBLIC и anon отозваны). handle_new_user и update_last_active оставлены
-- с дефолтным EXECUTE для PUBLIC (их вызывает Postgres из триггеров).
-- Гранты на таблицы — стандартные Supabase (по умолчанию), в дамп не включены.

-- ── Админ-функции: только authenticated ─────────────────────────────────────
revoke all on function public.admin_get_users() from public;
revoke all on function public.admin_get_users() from anon;
grant execute on function public.admin_get_users() to authenticated;

revoke all on function public.admin_get_dashboard_stats() from public;
revoke all on function public.admin_get_dashboard_stats() from anon;
grant execute on function public.admin_get_dashboard_stats() to authenticated;

revoke all on function public.admin_get_news() from public;
revoke all on function public.admin_get_news() from anon;
grant execute on function public.admin_get_news() to authenticated;

revoke all on function public.admin_update_news(text) from public;
revoke all on function public.admin_update_news(text) from anon;
grant execute on function public.admin_update_news(text) to authenticated;

revoke all on function public.admin_set_show_news(boolean) from public;
revoke all on function public.admin_set_show_news(boolean) from anon;
grant execute on function public.admin_set_show_news(boolean) to authenticated;

revoke all on function public.admin_get_support_chats() from public;
revoke all on function public.admin_get_support_chats() from anon;
grant execute on function public.admin_get_support_chats() to authenticated;

revoke all on function public.admin_get_support_chat(uuid) from public;
revoke all on function public.admin_get_support_chat(uuid) from anon;
grant execute on function public.admin_get_support_chat(uuid) to authenticated;

revoke all on function public.admin_send_support_message(uuid, text) from public;
revoke all on function public.admin_send_support_message(uuid, text) from anon;
grant execute on function public.admin_send_support_message(uuid, text) to authenticated;

revoke all on function public.admin_set_support_open(uuid, boolean) from public;
revoke all on function public.admin_set_support_open(uuid, boolean) from anon;
grant execute on function public.admin_set_support_open(uuid, boolean) to authenticated;

revoke all on function public.admin_clear_support_chat(uuid) from public;
revoke all on function public.admin_clear_support_chat(uuid) from anon;
grant execute on function public.admin_clear_support_chat(uuid) to authenticated;

revoke all on function public.admin_get_support_open_count() from public;
revoke all on function public.admin_get_support_open_count() from anon;
grant execute on function public.admin_get_support_open_count() to authenticated;

-- ── is_admin: только authenticated ──────────────────────────────────────────
revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

-- ── Триггерные функции: дефолт PUBLIC (без изменений) ───────────────────────
-- handle_new_user(), update_last_active() — EXECUTE для PUBLIC, anon,
-- authenticated, postgres, service_role (значения по умолчанию).