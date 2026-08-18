-- Индексы БД (инвентаризация по pg_indexes).
-- Ручные индексы (для производительности запросов) помечены; индексы *_pkey и
-- *_key создаются автоматически констрейнтами PRIMARY KEY / UNIQUE таблиц.

-- ── Ручные индексы ──────────────────────────────────────────────────────────
create index accumulations_category_id_idx on public.accumulations using btree (category_id);
create index accumulations_user_id_created_at_idx on public.accumulations using btree (user_id, created_at desc);
create index categories_user_id_type_idx on public.categories using btree (user_id, type);
create index operations_category_id_idx on public.operations using btree (category_id);
create index operations_report_type_created_at_idx on public.operations using btree (report_id, type, created_at desc);
create index operations_user_id_idx on public.operations using btree (user_id);
create index reports_user_id_created_at_idx on public.reports using btree (user_id, created_at desc);
create index support_messages_user_created_idx on public.support_messages using btree (user_id, author_role, created_at);

-- ── Индексы констрейнтов (создаются автоматически, для справки) ────────────
-- accumulations: accumulations_pkey (UNIQUE id)
-- categories: categories_pkey (UNIQUE id)
-- category_limits: category_limits_pkey (UNIQUE id),
--   category_limits_report_id_category_id_key (UNIQUE report_id, category_id)
-- news: news_pkey (UNIQUE id)
-- operations: operations_pkey (UNIQUE id)
-- profiles: profiles_pkey (UNIQUE user_id)
-- reports: reports_pkey (UNIQUE id)
-- support_chats: support_chats_pkey (UNIQUE user_id)
-- support_messages: support_messages_pkey (UNIQUE id)