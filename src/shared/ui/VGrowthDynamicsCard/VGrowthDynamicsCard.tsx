import { VCard } from '@/shared/ui/VCard';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { VSkeleton } from '@/shared/ui/VSkeleton';
import type { ChartPoint, GrowthAggregation } from '@/shared/utils/chartPoints';
import { VGrowthChart } from '@/shared/ui/VGrowthChart';
import { GrowthStats } from './GrowthStats';
import type { VGrowthStatsData } from './types';
import styles from './VGrowthDynamicsCard.module.css';

interface VGrowthDynamicsCardProps {
  title: string;
  isLoading: boolean;
  aggregation: GrowthAggregation;
  onAggregationChange: (aggregation: GrowthAggregation) => void;
  chartData: ChartPoint[];
  stats: VGrowthStatsData;
  base?: number;
  displaySymbol?: string;
}

const aggregationOptions: VButtonGroupOption[] = [
  { value: 'M', label: 'Месяц' },
  { value: 'Q', label: 'Квартал' },
  { value: 'HY', label: 'Полугодие' },
  { value: 'Y', label: 'Год' },
];

export const VGrowthDynamicsCard = ({
  title,
  isLoading,
  aggregation,
  onAggregationChange,
  chartData,
  stats,
  base = 0,
  displaySymbol,
}: VGrowthDynamicsCardProps) => (
  <VCard className={styles.mobileCompact}>
    <div className={styles.header}>
      <div className={styles.title}>{title}</div>
    </div>

    <div className={styles.controls}>
      <VButtonGroup
        options={aggregationOptions}
        value={aggregation}
        onChange={onAggregationChange}
      />
    </div>

    <GrowthStats stats={stats} displaySymbol={displaySymbol} />

    {isLoading ? (
      <VSkeleton width="100%" height={200} radius="var(--md-sys-shape-corner-small)" />
    ) : (
      <VGrowthChart
        data={chartData}
        color="var(--sys-color-positive-ink)"
        showChange={true}
        displaySymbol={displaySymbol}
        base={base}
      />
    )}
  </VCard>
);
