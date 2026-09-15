/**
 * Доменные типы приложения: строки-сущности БД в той форме, в которой их
 * отдаёт REST-бэкенд (`server/`, ключи snake_case, numeric — числом/строкой
 * по факту DTO). Это ЕДИНСТВЕННЫЙ источник правды о полях сущностей.
 *
 * Важно: здесь живут ТОЛЬКО сущности и чистые доменные хелперы.
 * Типы запросов/ответов конкретных эндпоинтов (XxxResponse/XxxRequest,
 * Admin-формы, сводки, input-формы мутаций) объявляются в файлах хуков
 * TanStack Query (`shared/api/hooks/*`, `modules/_<раздел>/api/*`) и
 * надстраиваются над этими типами.
 *
 * Поля amount типизированы числом — как их отдаёт серверные DTO
 * (numeric из pg приводится через toNumber в *_repository.ts). В формы-инпуты
 * значения попадают через String(...) — useState для <input> держит строку.
 */

export interface Operation {
  account_id: string | null;
  from_account_id: string | null;
  to_account_id: string | null;
  id: string;
  report_id: string;
  user_id: string;
  type: string;
  amount: number;
  category_id: string | null;
  description: string | null;
  date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  name: string;
  code: string;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  type: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryLimit {
  id: string;
  report_id: string;
  category_id: string;
  user_id: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

/**
 * Профиль: форма строк прежней таблицы profiles. GET /users/me отдаёт
 * camelCase PublicUser — адаптацию выполняет хук useProfile, поэтому
 * потребители (онбординг, валюта) не менялись. Стартовый баланс больше не
 * часть профиля: он принадлежит счетам (Account.initial_balance).
 */
export interface Profile {
  user_id: string;
  login: string;
  currency: string | null;
  onboarded: boolean;
  role: string;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Типы, принимаемые текущим API операций. */
export type ApiOperationType = 'income' | 'expense' | 'transfer';
/** Типы операций в списках и сводках периодов. */
export type OperationType = 'income' | 'expense';
export type CategoryType = 'expense' | 'income';

/** Счёт: точная форма AccountDto из API /accounts. Валюта хранится в профиле. */
export interface Account {
  id: string;
  user_id: string;
  name: string;
  initial_balance: number;
  balance: number;
  is_closed: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

/** Цель по счёту: зеркало GoalDto сервера. */
export interface Goal {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}
