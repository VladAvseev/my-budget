import type { Report } from '@/shared/supabase/types/domain';
import { VTreeSelect, type VTreeSelectItem } from '@/shared/ui/VTreeSelect';
import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { selectedReportIdsAtom } from '../atoms/overview';

interface ReportsFilterProps {
  reports: Report[];
}

const getYear = (report: Report): number => {
  const date = new Date(report.period_start);
  return date.getFullYear();
};

export const ReportsFilter = ({ reports }: ReportsFilterProps) => {
  const [selectedIds, setSelectedIds] = useAtom(selectedReportIdsAtom);

  const items = useMemo<VTreeSelectItem[]>(() => {
    if (reports.length === 0) return [];

    const grouped = new Map<number, Report[]>();
    for (const report of reports) {
      const year = getYear(report);
      const list = grouped.get(year);
      if (list) list.push(report);
      else grouped.set(year, [report]);
    }

    return [...grouped.entries()]
      .sort(([a], [b]) => b - a)
      .map(([year, yearReports]) => ({
        type: 'group' as const,
        label: `${year} год`,
        children: yearReports.map((report) => ({
          type: 'leaf' as const,
          value: report.id,
          label: report.name,
        })),
      }));
  }, [reports]);

  if (items.length === 0) {
    return null;
  }

  return (
    <VTreeSelect
      label="Отчёты"
      items={items}
      value={selectedIds}
      onChange={setSelectedIds}
      selectAll
    />
  );
};
