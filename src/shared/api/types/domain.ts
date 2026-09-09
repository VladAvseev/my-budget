/**
 * Доменные типы данных приложения.
 *
 * Раньше генерировались из схемы Supabase (database.types.ts). Теперь
 * описаны руками и зеркалят ответы REST-бэкенда (`server/`), который,
 * в свою очередь, точно воспроизводит jsonb-формы прежних RPC-функций:
 * ключи snake_case, numeric приходит ЧИСЛОМ (jsonb), но для совместимости
 * со старым кодом поля amount/start_balance типизированы строкой — UI
 * везде оборачивает их Number(...), строку и число это не ломает.
 */

export interface Operation {
  id: string;
  report_id: string;
  user_id: string;
  type: string;
  amount: string;
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
  daily_budget: string | null;
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
  amount: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  category_id: string;
  amount: string;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryLimit {
  id: string;
  report_id: string;
  category_id: string;
  user_id: string;
  amount: string;
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
  email: string;
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

export interface OperationInput {
  type: OperationType;
  amount: number;
  categoryId?: string | null;
  description?: string | null;
  date?: string | null;
}

export type OperationUpdateInput = Partial<OperationInput>;

export interface DailyExpenseInput {
  amount: number;
  categoryId?: string | null;
  description?: string | null;
}

export interface OperationSummary {
  income: number;
  expense: number;
  savings: number;
  daily: number;
}

export interface ReportInput {
  name: string;
  code?: string;
  hasDailyExpenses?: boolean;
  dailyBudget?: number | null;
  periodStart: string;
  periodEnd: string;
}

export type ReportUpdateInput = Partial<ReportInput>;

export interface CategoryCreateInput {
  type: CategoryType;
  name: string;
  color?: string | null;
}

export interface CategoryUpdateInput {
  name?: string;
  color?: string | null;
}

export interface AccumulationInput {
  amount: number;
  description: string;
  categoryId?: string | null;
}

export type AccumulationUpdateInput = Partial<AccumulationInput>;

export interface GoalInput {
  categoryId: string;
  amount: number;
  targetDate?: string | null;
}

export interface GoalUpdateInput {
  amount: number;
  targetDate?: string | null;
}

export interface CategoryLimitInput {
  reportId: string;
  categoryId: string;
  amount: number;
}

export interface ProfileInput {
  email?: string;
  startBalance?: number;
  onboarded?: boolean;
}

export interface AdminDashboardStats {
  users: {
    total: number;
    withoutReports: number;
    onboarded: number;
  };
  activity: {
    dau: number;
    wau: number;
    mau: number;
    qau: number;
    sau: number;
    yau: number;
  };
  churn: {
    inactive1d: number;
    inactive7d: number;
    inactive30d: number;
    inactive90d: number;
    inactive180d: number;
    inactive365d: number;
  };
  reports: {
    total: number;
    withDailyExpenses: number;
  };
  operations: {
    total: number;
    income: number;
    expense: number;
    daily: number;
    savings: number;
  };
}

export interface AdminUserRow {
  user_id: string;
  email: string;
  last_active_at: string | null;
  onboarded: boolean;
  reportsCount: number;
  operationsCount: number;
  categoriesCount: number;
  incomeCount: number;
  dailyCount: number;
  expenseCount: number;
  savingsCount: number;
  accumulationsCount: number;
  goalsCount: number;
}

export interface DatabaseSize {
  sizeBytes: number;
  sizePretty: string;
}
