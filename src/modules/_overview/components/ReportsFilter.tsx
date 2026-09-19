import { VTreeSelect, type VTreeSelectItem } from '@/shared/ui/VTreeSelect';
import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { formatMonthTitle, monthYear } from '@/shared/utils';
import { selectedMonthsAtom } from '../atoms/overview';

interface ReportsFilterProps {
  months: string[];
}

export const ReportsFilter = ({ months }: ReportsFilterProps) => {
  const [selected, setSelected] = useAtom(selectedMonthsAtom);

  const items = useMemo<VTreeSelectItem[]>(() => {
    if (months.length === 0) return [];

    const grouped = new Map<string, string[]>();
    for (const month of months) {
      const year = monthYear(month);
      const list = grouped.get(year);
      if (list) list.push(month);
      else grouped.set(year, [month]);
    }

    return [...grouped.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([year, yearMonths]) => ({
        type: 'group' as const,
        label: `${year} год`,
        children: [...yearMonths]
          .sort((a, b) => b.localeCompare(a))
          .map((month) => ({
            type: 'leaf' as const,
            value: month,
            label: formatMonthTitle(month),
          })),
      }));
  }, [months]);

  if (items.length === 0) {
    return null;
  }

  return (
    <VTreeSelect
      label="Периоды"
      items={items}
      value={selected}
      onChange={setSelected}
      selectAll
    />
  );
};
