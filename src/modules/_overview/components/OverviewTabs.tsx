import type { Report } from '@/shared/supabase/types/domain';
import { VMultiSelect } from '@/shared/ui/VMultiSelect';
import { useAtom } from 'jotai';
import { selectedReportIdsAtom } from '../atoms/overview';

interface OverviewTabsProps {
  reports: Report[];
}

export const OverviewTabs = ({ reports }: OverviewTabsProps) => {
  const [selectedIds, setSelectedIds] = useAtom(selectedReportIdsAtom);

  if (reports.length === 0) {
    return null;
  }

  const options = reports.map((report) => ({
    value: report.id,
    label: report.name,
  }));

  return (
    <VMultiSelect
      label="Отчёты"
      options={options}
      value={selectedIds}
      onChange={setSelectedIds}
      selectAll
      placeholder="Выберите отчёты"
    />
  );
};
