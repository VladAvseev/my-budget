export type AdminAudience = 'all' | 'users';

export type AdminChartMetric = 'count' | 'unique_users';

export type AdminOperationsAggregation = 'D' | 'M' | 'Y';

export type AdminLogsBucket = 'hour' | 'day';

export interface AdminChartPoint {
  period: string;
  value: number;
}
