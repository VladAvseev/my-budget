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
 * Поля amount/daily_budget типизированы числом — как их отдаёт серверные DTO
 * (numeric из pg приводится через toNumber в *_repository.ts). В формы-инпуты
 * значения попадают через String(...) — useState для <input> держит строку.
 */

export interface Operation {
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
  has_daily_expenses: boolean;
  daily_budget: number | null;
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

export interface Accumulation {
  id: string;
  user_id: string;
  category_id: string | null;
  description: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  target_date: string | null;
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
 * потребители (AccountCard, StartBalanceCard, онбординг) не менялись.
 */
export interface Profile {
  user_id: string;
  login: string;
  start_balance: string;
  currency: string | null;
  onboarded: boolean;
  role: string;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export type OperationType = 'income' | 'expense' | 'savings' | 'savings_out' | 'daily';
export type CategoryType = 'expense' | 'income' | 'savings';

export const isSavingsType = (type: OperationType): boolean =>
  type === 'savings' || type === 'savings_out';

export const operationSign = (type: OperationType): 1 | -1 => (type === 'savings_out' ? -1 : 1);

export const signedOperationAmount = (type: OperationType, amount: number): number =>
  amount * operationSign(type);
