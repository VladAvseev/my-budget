import type { Report } from '@/shared/api/types/domain';
import { VLoader } from '@/shared/ui/VLoader';
import { VSelect, type VSelectOption } from '@/shared/ui/VSelect';
import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { comparedReportIdAtom } from '../atoms/overview';
import styles from './PeriodCompareSelect.module.css';

interface PeriodCompareSelectProps {
  reports: Report[];
  isLoading?: boolean;
}

export const PeriodCompareSelect = ({ reports, isLoading }: PeriodCompareSelectProps) => {
  const [comparedId, setComparedId] = useAtom(comparedReportIdAtom);

  const options = useMemo<VSelectOption[]>(
    () =>
      [...reports]
        .sort((a, b) => new Date(b.period_start).getTime() - new Date(a.period_start).getTime())
        .map((report) => ({ value: report.id, label: report.name })),
    [reports],
  );

  return (
    <div className={styles.row}>
      <VSelect
        className={styles.select}
        label="Период для сравнения"
        options={options}
        value={comparedId}
        onChange={setComparedId}
      />
      {isLoading && (
        <span className={styles.loader} title="Загружаются данные по выбранному периоду">
          <VLoader size={20} />
        </span>
      )}
    </div>
  );
};
