import type { Database } from './database.types';

export type Operation = Database['public']['Tables']['operations']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Accumulation = Database['public']['Tables']['accumulations']['Row'];
export type Goal = Database['public']['Tables']['goals']['Row'];
export type CategoryLimit = Database['public']['Tables']['category_limits']['Row'];
export type NewsRow = Database['public']['Tables']['news']['Row'];
export type SupportChat = Database['public']['Tables']['support_chats']['Row'];
export type SupportMessage = Database['public']['Tables']['support_messages']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

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
  hasDailyExpenses?: boolean;
  dailyBudget?: number | null;
  periodStart?: string | null;
  periodEnd?: string | null;
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
}

export interface GoalUpdateInput {
  amount: number;
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
  showNews?: boolean;
}

export interface SupportChatData {
  messages: SupportMessage[];
  isOpen: boolean;
  userReadAt: string | null;
  unreadCount: number;
  chatExists: boolean;
}

export interface AdminDashboardStats {
  users: {
    total: number;
    withoutReports: number;
    onboarded: number;
    sawNews: number;
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
  sawNews: boolean;
  reportsCount: number;
  operationsCount: number;
  categoriesCount: number;
  incomeCount: number;
  dailyCount: number;
  expenseCount: number;
  savingsCount: number;
  accumulationsCount: number;
}

export interface DatabaseSize {
  sizeBytes: number;
  sizePretty: string;
}

export interface AdminSupportStatus {
  open: number;
  unanswered: number;
  avgResponseHours: number | null;
}

export interface AdminSupportChat {
  user_id: string;
  email: string;
  isOpen: boolean;
  unreadCount: number;
  lastText: string | null;
  lastAt: string | null;
}