export interface NewsRow {
  id: number;
  text: string;
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
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          email: string;
          start_balance: string;
          onboarded: boolean;
          show_news: boolean;
          role: string;
          last_active_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          email?: string;
          start_balance?: string;
          onboarded?: boolean;
          show_news?: boolean;
          role?: string;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          email?: string;
          start_balance?: string;
          onboarded?: boolean;
          show_news?: boolean;
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
          has_daily_expenses: boolean;
          daily_budget: string | null;
          period_start: string | null;
          period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          has_daily_expenses?: boolean;
          daily_budget?: string | null;
          period_start?: string | null;
          period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          has_daily_expenses?: boolean;
          daily_budget?: string | null;
          period_start?: string | null;
          period_end?: string | null;
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
      news: {
        Row: {
          id: number;
          text: string;
        };
        Insert: {
          id?: number;
          text: string;
        };
        Update: {
          id?: number;
          text?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      admin_get_dashboard_stats: {
        Args: Record<string, never>;
        Returns: AdminDashboardStats;
      };
      admin_get_users: {
        Args: Record<string, never>;
        Returns: AdminUserRow[];
      };
      admin_get_news: {
        Args: Record<string, never>;
        Returns: NewsRow;
      };
      admin_update_news: {
        Args: {
          p_text: string;
        };
        Returns: undefined;
      };
      admin_set_show_news: {
        Args: {
          p_show: boolean;
        };
        Returns: undefined;
      };
    };
  };
}
