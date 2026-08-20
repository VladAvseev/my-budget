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

revoke all on function public.admin_get_database_size() from public;
revoke all on function public.admin_get_database_size() from anon;
grant execute on function public.admin_get_database_size() to authenticated;

revoke all on function public.admin_get_support_status() from public;
revoke all on function public.admin_get_support_status() from anon;
grant execute on function public.admin_get_support_status() to authenticated;

-- ── is_admin: только authenticated ──────────────────────────────────────────
revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

-- ── Триггерные функции: дефолт PUBLIC (без изменений) ───────────────────────
-- handle_new_user(), update_last_active() — EXECUTE для PUBLIC, anon,
-- authenticated, postgres, service_role (значения по умолчанию).

-- ── Пользовательские функции (SECURITY INVOKER + auth.uid()): ───────────────
-- только authenticated (PUBLIC и anon отозваны). Собираются вручную при
-- добавлении новых функций в .sql рядом с хуками.
revoke all on function public.get_or_create_profile(text) from public;
revoke all on function public.get_or_create_profile(text) from anon;
grant execute on function public.get_or_create_profile(text) to authenticated;

revoke all on function public.get_user_summary(uuid) from public;
revoke all on function public.get_user_summary(uuid) from anon;
grant execute on function public.get_user_summary(uuid) to authenticated;

revoke all on function public.get_accumulations(uuid) from public;
revoke all on function public.get_accumulations(uuid) from anon;
grant execute on function public.get_accumulations(uuid) to authenticated;

revoke all on function public.get_report_summary(uuid) from public;
revoke all on function public.get_report_summary(uuid) from anon;
grant execute on function public.get_report_summary(uuid) to authenticated;

revoke all on function public.get_reports() from public;
revoke all on function public.get_reports() from anon;
grant execute on function public.get_reports() to authenticated;

revoke all on function public.get_latest_news() from public;
revoke all on function public.get_latest_news() from anon;
grant execute on function public.get_latest_news() to authenticated;

revoke all on function public.hide_news() from public;
revoke all on function public.hide_news() from anon;
grant execute on function public.hide_news() to authenticated;

revoke all on function public.get_savings_operations(uuid) from public;
revoke all on function public.get_savings_operations(uuid) from anon;
grant execute on function public.get_savings_operations(uuid) to authenticated;

revoke all on function public.get_onboarding_state(uuid) from public;
revoke all on function public.get_onboarding_state(uuid) from anon;
grant execute on function public.get_onboarding_state(uuid) to authenticated;

revoke all on function public.complete_onboarding() from public;
revoke all on function public.complete_onboarding() from anon;
grant execute on function public.complete_onboarding() to authenticated;

revoke all on function public.get_categories(uuid, text) from public;
revoke all on function public.get_categories(uuid, text) from anon;
grant execute on function public.get_categories(uuid, text) to authenticated;

revoke all on function public.create_report(text, boolean, numeric, date, date) from public;
revoke all on function public.create_report(text, boolean, numeric, date, date) from anon;
grant execute on function public.create_report(text, boolean, numeric, date, date) to authenticated;

revoke all on function public.get_report(uuid) from public;
revoke all on function public.get_report(uuid) from anon;
grant execute on function public.get_report(uuid) to authenticated;

revoke all on function public.get_operations_by_report(uuid, text) from public;
revoke all on function public.get_operations_by_report(uuid, text) from anon;
grant execute on function public.get_operations_by_report(uuid, text) to authenticated;

revoke all on function public.get_category_limits(uuid) from public;
revoke all on function public.get_category_limits(uuid) from anon;
grant execute on function public.get_category_limits(uuid) to authenticated;

revoke all on function public.create_operation(uuid, text, numeric, uuid, text, date) from public;
revoke all on function public.create_operation(uuid, text, numeric, uuid, text, date) from anon;
grant execute on function public.create_operation(uuid, text, numeric, uuid, text, date) to authenticated;

revoke all on function public.update_operation(uuid, numeric, uuid, text, text, date) from public;
revoke all on function public.update_operation(uuid, numeric, uuid, text, text, date) from anon;
grant execute on function public.update_operation(uuid, numeric, uuid, text, text, date) to authenticated;

revoke all on function public.delete_operation(uuid) from public;
revoke all on function public.delete_operation(uuid) from anon;
grant execute on function public.delete_operation(uuid) to authenticated;

revoke all on function public.create_daily_expense(uuid, numeric, text, date, date) from public;
revoke all on function public.create_daily_expense(uuid, numeric, text, date, date) from anon;
grant execute on function public.create_daily_expense(uuid, numeric, text, date, date) to authenticated;

revoke all on function public.update_report(uuid, text, boolean, numeric, date, date) from public;
revoke all on function public.update_report(uuid, text, boolean, numeric, date, date) from anon;
grant execute on function public.update_report(uuid, text, boolean, numeric, date, date) to authenticated;

revoke all on function public.set_category_limits(uuid, jsonb) from public;
revoke all on function public.set_category_limits(uuid, jsonb) from anon;
grant execute on function public.set_category_limits(uuid, jsonb) to authenticated;

revoke all on function public.delete_report(uuid) from public;
revoke all on function public.delete_report(uuid) from anon;
grant execute on function public.delete_report(uuid) to authenticated;

revoke all on function public.disable_daily_expenses(uuid) from public;
revoke all on function public.disable_daily_expenses(uuid) from anon;
grant execute on function public.disable_daily_expenses(uuid) to authenticated;

revoke all on function public.get_operations_by_reports(uuid[]) from public;
revoke all on function public.get_operations_by_reports(uuid[]) from anon;
grant execute on function public.get_operations_by_reports(uuid[]) to authenticated;

revoke all on function public.create_accumulation(numeric, text, uuid) from public;
revoke all on function public.create_accumulation(numeric, text, uuid) from anon;
grant execute on function public.create_accumulation(numeric, text, uuid) to authenticated;

revoke all on function public.update_accumulation(uuid, numeric, text, uuid) from public;
revoke all on function public.update_accumulation(uuid, numeric, text, uuid) from anon;
grant execute on function public.update_accumulation(uuid, numeric, text, uuid) to authenticated;

revoke all on function public.delete_accumulation(uuid) from public;
revoke all on function public.delete_accumulation(uuid) from anon;
grant execute on function public.delete_accumulation(uuid) to authenticated;

revoke all on function public.create_category(text, text, text) from public;
revoke all on function public.create_category(text, text, text) from anon;
grant execute on function public.create_category(text, text, text) to authenticated;

revoke all on function public.update_category(uuid, text, text) from public;
revoke all on function public.update_category(uuid, text, text) from anon;
grant execute on function public.update_category(uuid, text, text) to authenticated;

revoke all on function public.delete_category(uuid) from public;
revoke all on function public.delete_category(uuid) from anon;
grant execute on function public.delete_category(uuid) to authenticated;

revoke all on function public.update_start_balance(numeric) from public;
revoke all on function public.update_start_balance(numeric) from anon;
grant execute on function public.update_start_balance(numeric) to authenticated;

revoke all on function public.get_support_chat(uuid) from public;
revoke all on function public.get_support_chat(uuid) from anon;
grant execute on function public.get_support_chat(uuid) to authenticated;

revoke all on function public.get_support_unread_count(uuid) from public;
revoke all on function public.get_support_unread_count(uuid) from anon;
grant execute on function public.get_support_unread_count(uuid) to authenticated;

revoke all on function public.send_support_message(text) from public;
revoke all on function public.send_support_message(text) from anon;
grant execute on function public.send_support_message(text) to authenticated;

revoke all on function public.mark_support_read() from public;
revoke all on function public.mark_support_read() from anon;
grant execute on function public.mark_support_read() to authenticated;