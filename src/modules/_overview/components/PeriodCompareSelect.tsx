import type { Report } from '@/shared/api/types/domain';
import { VSelect, type VSelectOption } from '@/shared/ui/VSelect';
import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { comparedReportIdAtom } from '../atoms/overview';

interface PeriodCompareSelectProps {
  reports: Report[];
}

export const PeriodCompareSelect = ({ reports }: PeriodCompareSelectProps) => {
  const [comparedId, setComparedId] = useAtom(comparedReportIdAtom);

  const options = useMemo<VSelectOption[]>(
    () =>
      [...reports]
        .sort((a, b) => new Date(b.period_start).getTime() - new Date(a.period_start).getTime())
        .map((report) => ({ value: report.id, label: report.name })),
    [reports],
  );

  return (
    <VSelect
      label="Период для сравнения"
      options={options}
      value={comparedId}
      onChange={setComparedId}
    />
  );
};
