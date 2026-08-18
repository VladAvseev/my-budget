-- Расширения PostgreSQL (инвентаризация по pg_extension).
-- Все перечисленные расширения создаются Supabase платформой по умолчанию,
-- пользователь их не создавал. Для воспроизведения схемы на другой базе:

create extension if not exists plpgsql;
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;
create extension if not exists pg_stat_statements;
create extension if not exists supabase_vault;

-- Версии в текущей БД: pg_stat_statements 1.11, pgcrypto 1.3, plpgsql 1.0,
-- supabase_vault 0.3.1, uuid-ossp 1.1.