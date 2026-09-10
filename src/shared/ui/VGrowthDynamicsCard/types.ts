import type { PointChange } from '@/shared/utils/chartPoints';

export type VGrowthDynamicsMode = 'total' | 'period';

export interface VGrowthStatsData {
  monthly: PointChange | null;
  recent: PointChange | null;
  periodLabel: string;
  currentPeriod: PointChange | null;
  currentPeriodLabel: string;
}
