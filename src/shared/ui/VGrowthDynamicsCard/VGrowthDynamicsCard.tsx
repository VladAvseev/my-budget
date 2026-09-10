import { VCard } from '@/shared/ui/VCard';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { VLoader } from '@/shared/ui/VLoader';
import commonStyles from '@/shared/styles/common.module.css';
import type { ChartPoint, GrowthAggregation } from '@/shared/utils/chartPoints';
import { VGrowthChart } from '@/shared/ui/VGrowthChart';
import { GrowthStats } from './GrowthStats';
import type { VGrowthDynamicsMode, VGrowthStatsData } from './types';
import styles from './VGrowthDynamicsCard.module.css';

interface VGrowthDynamicsCardProps {
  title: string;
  isLoading: boolean;
  mode: VGrowthDynamicsMode;
  aggregation: GrowthAggregation;
  onModeChange: (mode: VGrowthDynamicsMode) => void;
  onAggregationChange: (aggregation: GrowthAggregation) => void;
  chartData: ChartPoint[];
  stats: VGrowthStatsData;
  base?: number;
  displaySymbol?: string;
}

const modeOptions: VButtonGroupOption[] = [
  { value: 'total', label: 'Всего' },
  { value: 'period', label: 'За период' },
];

const aggregationOptions: VButtonGroupOption[] = [
  { value: 'M', label: 'мес' },
  { value: 'Q', label: 'кв' },
  { value: 'HY', label: 'пг' },
  { value: 'Y', label: 'год' },
];

const modeColors: Record<VGrowthDynamicsMode, string> = {
  total: 'var(--color-success)',
  period: 'var(--color-accent)',
};

export const VGrowthDynamicsCard = ({
  title,
  isLoading,
  mode,
  aggregation,
  onModeChange,
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
      <VButtonGroup options={modeOptions} value={mode} onChange={onModeChange} />
      <VButtonGroup
        options={aggregationOptions}
        value={aggregation}
        onChange={onAggregationChange}
      />
    </div>

    <GrowthStats stats={stats} displaySymbol={displaySymbol} />

    {isLoading ? (
      <div className={commonStyles.loaderContainer}>
        <VLoader />
      </div>
    ) : (
      <VGrowthChart
        data={chartData}
        color={modeColors[mode]}
        showChange={mode === 'total'}
        displaySymbol={displaySymbol}
        base={base}
      />
    )}
  </VCard>
);
