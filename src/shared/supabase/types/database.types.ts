import type {
  Accumulation,
  AdminDashboardStats,
  AdminUserRow,
  Category,
  CategoryLimit,
  DatabaseSize,
  Goal,
  Operation,
  OperationSummary,
  Profile,
  Report,
} from './domain';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          email: string;
          start_balance: string;
          currency: string | null;
          onboarded: boolean;
          role: string;
          last_active_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          email?: string;
          start_balance?: string;
          currency?: string | null;
          onboarded?: boolean;
          role?: string;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          email?: string;
          start_balance?: string;
          currency?: string | null;
          onboarded?: boolean;
          role?: string;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          code?: string;
          has_daily_expenses?: boolean;
          daily_budget?: string | null;
          period_start: string;
          period_end: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          code?: string;
          has_daily_expenses?: boolean;
          daily_budget?: string | null;
          period_start?: string;
          period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          name: string;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          type?: string;
          name: string;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          name?: string;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      operations: {
        Row: {
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
        };
        Insert: {
          id?: string;
          report_id: string;
          user_id?: string;
          type: string;
          amount: string;
          category_id?: string | null;
          description?: string | null;
          date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          user_id?: string;
          type?: string;
          amount?: string;
          category_id?: string | null;
          description?: string | null;
          date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      accumulations: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          description: string;
          amount: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          description: string;
          amount?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          description?: string;
          amount?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount: string;
          target_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          category_id: string;
          amount?: string;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          amount?: string;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      category_limits: {
        Row: {
          id: string;
          report_id: string;
          category_id: string;
          user_id: string;
          amount: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          category_id: string;
          user_id?: string;
          amount: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          category_id?: string;
          user_id?: string;
          amount?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_or_create_profile: {
        Args: {
          p_email: string;
        };
        Returns: Profile;
      };
      get_user_summary: {
        Args: {
          p_user_id: string;
        };
        Returns: OperationSummary;
      };
      get_accumulations: {
        Args: {
          p_user_id: string;
        };
        Returns: Accumulation[];
      };
      get_report_summary: {
        Args: {
          p_report_id: string;
        };
        Returns: OperationSummary;
      };
      get_reports: {
        Args: Record<string, never>;
        Returns: Report[];
      };
      get_savings_operations: {
        Args: {
          p_user_id: string;
        };
        Returns: Array<Operation & { reportName: string; reportPeriodStart: string }>;
      };
      get_onboarding_state: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          categories: number;
          reports: number;
          operations: number;
        };
      };
      complete_onboarding: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      get_categories: {
        Args: {
          p_user_id: string;
          p_type: string | null;
        };
        Returns: Category[];
      };
      create_report: {
        Args: {
          p_name: string;
          p_code: string;
          p_has_daily_expenses: boolean;
          p_daily_budget: number | null;
          p_period_start: string | null;
          p_period_end: string | null;
        };
        Returns: Report;
      };
      get_report: {
        Args: {
          p_report_id: string;
        };
        Returns: Report | null;
      };
      get_operations_by_report: {
        Args: {
          p_report_id: string;
          p_type: string;
        };
        Returns: Operation[];
      };
      get_category_limits: {
        Args: {
          p_report_id: string;
        };
        Returns: CategoryLimit[];
      };
      create_operation: {
        Args: {
          p_report_id: string;
          p_type: string;
          p_amount: number;
          p_category_id: string | null;
          p_description: string | null;
          p_date: string | null;
        };
        Returns: Operation;
      };
      update_operation: {
        Args: {
          p_id: string;
          p_amount: number | null;
          p_category_id: string | null;
          p_description: string | null;
          p_type: string | null;
          p_date: string | null;
        };
        Returns: Operation;
      };
      delete_operation: {
        Args: {
          p_id: string;
        };
        Returns: undefined;
      };
      create_daily_expense: {
        Args: {
          p_report_id: string;
          p_amount: number;
          p_description: string | null;
          p_period_start: string;
          p_period_end: string;
        };
        Returns: Operation;
      };
      update_report: {
        Args: {
          p_id: string;
          p_name: string | null;
          p_has_daily_expenses: boolean | null;
          p_daily_budget: number | null;
          p_period_start: string | null;
          p_period_end: string | null;
        };
        Returns: Report;
      };
      set_category_limits: {
        Args: {
          p_report_id: string;
          p_limits: unknown;
        };
        Returns: CategoryLimit[];
      };
      delete_report: {
        Args: {
          p_id: string;
        };
        Returns: undefined;
      };
      disable_daily_expenses: {
        Args: {
          p_report_id: string;
        };
        Returns: undefined;
      };
      get_operations_by_reports: {
        Args: {
          p_report_ids: string[];
        };
        Returns: Operation[];
      };
      create_accumulation: {
        Args: {
          p_amount: number;
          p_description: string;
          p_category_id: string | null;
        };
        Returns: Accumulation;
      };
      update_accumulation: {
        Args: {
          p_id: string;
          p_amount: number | null;
          p_description: string | null;
          p_category_id: string | null;
        };
        Returns: Accumulation;
      };
      delete_accumulation: {
        Args: {
          p_id: string;
        };
        Returns: undefined;
      };
      get_goals: {
        Args: {
          p_user_id: string;
        };
        Returns: Goal[];
      };
      create_goal: {
        Args: {
          p_category_id: string;
          p_amount: number;
          p_target_date: string | null;
        };
        Returns: Goal;
      };
      update_goal: {
        Args: {
          p_id: string;
          p_amount: number;
          p_target_date: string | null;
        };
        Returns: Goal;
      };
      delete_goal: {
        Args: {
          p_id: string;
        };
        Returns: undefined;
      };
      create_category: {
        Args: {
          p_type: string;
          p_name: string;
          p_color: string | null;
        };
        Returns: Category;
      };
      update_category: {
        Args: {
          p_id: string;
          p_name: string | null;
          p_color: string | null;
        };
        Returns: Category;
      };
      delete_category: {
        Args: {
          p_id: string;
        };
        Returns: undefined;
      };
      update_start_balance: {
        Args: {
          p_amount: number;
        };
        Returns: undefined;
      };
      update_currency: {
        Args: {
          p_currency: string | null;
        };
        Returns: undefined;
      };
      admin_get_dashboard_stats: {
        Args: Record<string, never>;
        Returns: AdminDashboardStats;
      };
      admin_get_users: {
        Args: Record<string, never>;
        Returns: AdminUserRow[];
      };
      admin_get_database_size: {
        Args: Record<string, never>;
        Returns: DatabaseSize;
      };
      admin_get_operations_dynamics: {
        Args: Record<string, never>;
        Returns: { day: string; operations_count: number }[];
      };
    };
  };
}
