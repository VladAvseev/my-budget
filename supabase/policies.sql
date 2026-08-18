-- RLS-политики (инвентаризация по pg_policies).
-- RLS включён на всех таблицах: profiles, reports, categories, operations,
-- accumulations, category_limits, news, support_chats, support_messages.
-- Политики owner-доступа: пользователь видит/меняет только свои строки.
-- Админ-доступ реализован через SECURITY DEFINER RPC (см. functions.sql),
-- прямых админ-политик с is_admin() в БД больше нет.

-- ── profiles (роль public) ──────────────────────────────────────────────────
create policy "Профиль доступен владельцу" on public.profiles
  for select using (auth.uid() = user_id);
create policy "Создание собственного профиля" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "Обновление собственного профиля" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Удаление собственного профиля" on public.profiles
  for delete using (auth.uid() = user_id);

-- ── reports (роль public) ───────────────────────────────────────────────────
create policy "Отчёты видны владельцу" on public.reports
  for select using (auth.uid() = user_id);
create policy "Создание отчёта" on public.reports
  for insert with check (auth.uid() = user_id);
create policy "Обновление отчёта" on public.reports
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Удаление отчёта" on public.reports
  for delete using (auth.uid() = user_id);

-- ── categories (роль authenticated) ─────────────────────────────────────────
create policy categories_select_own on public.categories
  for select to authenticated using (auth.uid() = user_id);
create policy categories_insert_own on public.categories
  for insert to authenticated with check (auth.uid() = user_id);
create policy categories_update_own on public.categories
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy categories_delete_own on public.categories
  for delete to authenticated using (auth.uid() = user_id);

-- ── operations (роль authenticated) ─────────────────────────────────────────
create policy operations_select_own on public.operations
  for select to authenticated using (auth.uid() = user_id);
create policy operations_insert_own on public.operations
  for insert to authenticated with check (auth.uid() = user_id);
create policy operations_update_own on public.operations
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy operations_delete_own on public.operations
  for delete to authenticated using (auth.uid() = user_id);

-- ── accumulations (роль public) ─────────────────────────────────────────────
create policy accumulations_select_own on public.accumulations
  for select using (auth.uid() = user_id);
create policy accumulations_insert_own on public.accumulations
  for insert with check (auth.uid() = user_id);
create policy accumulations_update_own on public.accumulations
  for update using (auth.uid() = user_id);
create policy accumulations_delete_own on public.accumulations
  for delete using (auth.uid() = user_id);

-- ── category_limits (роль public) ───────────────────────────────────────────
create policy category_limits_select_own on public.category_limits
  for select using (user_id = auth.uid());
create policy category_limits_insert_own on public.category_limits
  for insert with check (user_id = auth.uid());
create policy category_limits_update_own on public.category_limits
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy category_limits_delete_own on public.category_limits
  for delete using (user_id = auth.uid());

-- ── news (роль authenticated) ───────────────────────────────────────────────
create policy news_select_authenticated on public.news
  for select to authenticated using (true);

-- ── support_chats (роль public) ─────────────────────────────────────────────
create policy support_chats_select_own on public.support_chats
  for select using (user_id = auth.uid());
create policy support_chats_insert_own on public.support_chats
  for insert with check ((user_id = auth.uid()) and is_open);
create policy support_chats_update_own on public.support_chats
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── support_messages (роль public) ──────────────────────────────────────────
create policy support_messages_select_own on public.support_messages
  for select using (user_id = auth.uid());
create policy support_messages_insert_own on public.support_messages
  for insert with check ((user_id = auth.uid()) and (author_role = 'user'::text));