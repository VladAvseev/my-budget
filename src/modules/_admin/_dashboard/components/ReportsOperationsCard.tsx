import { useMemo, useState } from 'react';
import commonStyles from '@/shared/styles/common.module.css';
import type { AdminDashboardStats } from '@/shared/api/types/domain';
import { VCard } from '@/shared/ui/VCard';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { DonutChart, type DonutSegment } from '@/shared/ui/DonutChart';
import styles from './ReportsOperationsCard.module.css';

type StructureTab = 'periods' | 'operations';

const TAB_OPTIONS: VButtonGroupOption[] = [
  { value: 'periods', label: 'Периоды' },
  { value: 'operations', label: 'Операции' },
];

const percent = (value: number, total: number): number =>
  total === 0 ? 0 : Math.round((value / total) * 100);

interface ReportsOperationsCardProps {
  reports: AdminDashboardStats['reports'];
  operations: AdminDashboardStats['operations'];
}

interface StructureItem {
  key: string;
  label: string;
  color: string;
  value: number;
}

const PERIOD_ITEMS: StructureItem[] = [
  { key: 'withDaily', label: 'С еж. расходами', color: 'var(--color-success)', value: 0 },
  { key: 'withoutDaily', label: 'Без еж. расходов', color: 'var(--color-accent)', value: 0 },
];

const OPERATION_ITEMS: StructureItem[] = [
  { key: 'income', label: 'Доходы', color: 'var(--color-success)', value: 0 },
  { key: 'expense', label: 'Расходы', color: 'var(--color-error)', value: 0 },
  { key: 'daily', label: 'Ежедневные', color: 'var(--color-accent)', value: 0 },
  { key: 'savings', label: 'Накопления', color: 'var(--color-warning)', value: 0 },
];

export const ReportsOperationsCard: React.FC<ReportsOperationsCardProps> = ({
  reports,
  operations,
}) => {
  const [tab, setTab] = useState<StructureTab>('periods');

  const segments = useMemo(() => {
    const items =
      tab === 'periods'
        ? PERIOD_ITEMS.map((item) => ({
            ...item,
            value:
              item.key === 'withDaily'
                ? reports.withDailyExpenses
                : reports.total - reports.withDailyExpenses,
          }))
        : OPERATION_ITEMS.map((item) => ({
            ...item,
            value: operations[item.key as keyof typeof operations],
          }));

    const total = items.reduce((sum, item) => sum + item.value, 0);

    const sorted = [...items].sort((a, b) => b.value - a.value);

    let cursor = 0;
    const result: DonutSegment[] = [];
    for (const item of sorted) {
      const pct = total > 0 ? (item.value / total) * 100 : 0;
      result.push({
        key: item.key,
        label: item.label,
        color: item.color,
        total: item.value,
        percent: pct,
        start: cursor,
        end: cursor + pct,
      });
      cursor += pct;
    }
    return result;
  }, [tab, reports, operations]);

  const total = segments.reduce((sum, s) => sum + s.total, 0);

  return (
    <VCard className={styles.card}>
      <div className={styles.header}>
        <div className={commonStyles.cardTitle}>Структура периодов и операций</div>
        <VButtonGroup
          options={TAB_OPTIONS}
          value={tab}
          onChange={(v) => setTab(v as StructureTab)}
        />
      </div>

      {total === 0 ? (
        <div className={styles.message}>Нет данных</div>
      ) : (
        <div className={styles.body}>
          <DonutChart segments={segments} total={total} displaySymbol="" />

          <div className={styles.legend}>
            {segments.map((segment) => [
              <span
                key={`${segment.key}-dot`}
                className={styles.dot}
                style={{ ['--segment-color' as string]: segment.color }}
              />,
              <span key={`${segment.key}-label`} className={styles.label}>
                {segment.label}
              </span>,
              <span key={`${segment.key}-percent`} className={styles.percent}>
                {percent(segment.total, total)}%
              </span>,
              <span key={`${segment.key}-value`} className={styles.value}>
                {segment.total}
              </span>,
            ])}
          </div>
        </div>
      )}
    </VCard>
  );
};
