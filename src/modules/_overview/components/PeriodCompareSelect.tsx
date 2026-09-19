import { VSelect, type VSelectOption } from '@/shared/ui/VSelect';
import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { formatMonthTitle } from '@/shared/utils';
import { comparedMonthAtom } from '../atoms/overview';

interface PeriodCompareSelectProps {
  months: string[];
  isLoading?: boolean;
}

export const PeriodCompareSelect = ({ months, isLoading }: PeriodCompareSelectProps) => {
  const [compared, setCompared] = useAtom(comparedMonthAtom);

  const options = useMemo<VSelectOption[]>(
    () =>
      [...months]
        .sort((a, b) => b.localeCompare(a))
        .map((month) => ({ value: month, label: formatMonthTitle(month) })),
    [months],
  );

  return (
    <VSelect
      label="Период для сравнения"
      options={options}
      value={compared}
      onChange={setCompared}
      loading={isLoading}
    />
  );
};
