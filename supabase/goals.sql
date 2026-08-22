-- Миграция: цели накоплений (goals).
-- Выполнить в SQL-редакторе Supabase один раз перед применением functions.sql.
-- Таблица хранит цель (сумму) по savings-категории пользователя;
-- одна цель на категорию (unique), записи принадлежат владельцу (RLS).

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  category_id uuid not null,
  amount numeric not null check (amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category_id)
);

alter table public.goals enable row level security;

create policy goals_select_own on public.goals
  for select to authenticated using (auth.uid() = user_id);
create policy goals_insert_own on public.goals
  for insert to authenticated with check (auth.uid() = user_id);
create policy goals_update_own on public.goals
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy goals_delete_own on public.goals
  for delete to authenticated using (auth.uid() = user_id);

create index goals_user_id_idx on public.goals using btree (user_id);
