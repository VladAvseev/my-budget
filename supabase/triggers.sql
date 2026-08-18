-- Триггеры БД (инвентаризация по pg_get_triggerdef).
-- Тела функций триггеров — в functions.sql (handle_new_user, update_last_active).

-- Создание профиля при регистрации пользователя.
create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- Обновление last_active_at в профиле при добавлении операции.
create trigger trg_operations_last_active
after insert on public.operations
for each row execute function update_last_active();