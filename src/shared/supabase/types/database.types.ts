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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          email?: string;
          start_balance?: string;
          onboarded?: boolean;
          show_news?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          email?: string;
          start_balance?: string;
          onboarded?: boolean;
          show_news?: boolean;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
