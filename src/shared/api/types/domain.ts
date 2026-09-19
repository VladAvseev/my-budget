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
  limit_amount: number | null;
  show_daily_limit: boolean;
  created_at: string;
  updated_at: string;
}


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


export type ApiOperationType = 'income' | 'expense' | 'transfer';

export type OperationType = 'income' | 'expense';
export type CategoryType = 'expense' | 'income';


export interface Account {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  initial_balance: number;
  balance: number;
  is_closed: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}


export interface Goal {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}
