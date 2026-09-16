import type { PointChange } from '@/shared/utils/chartPoints';

export interface VGrowthStatsData {
  monthly: PointChange | null;
  recent: PointChange | null;
  periodLabel: string;
  currentPeriod: PointChange | null;
  currentPeriodLabel: string;
}
