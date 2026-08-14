import { EyeIcon, EyeOffIcon } from '@/shared/icons';
import type { Report } from '@/shared/supabase/services/reports';
import { VIconButton } from '@/shared/ui/VIconButton';
import { useAtom } from 'jotai';
import { excludedReportIdsAtom, tabsExpandedAtom } from '../atoms/overview';
import styles from './OverviewTabs.module.css';

interface OverviewTabsProps {
  reports: Report[];
}

export const OverviewTabs = ({ reports }: OverviewTabsProps) => {
  const [isExpanded, setIsExpanded] = useAtom(tabsExpandedAtom);
  const [excludedIds, setExcludedIds] = useAtom(excludedReportIdsAtom);

  if (reports.length === 0) {
    return null;
  }

  const excluded = new Set(excludedIds);
  const selectedCount = reports.length - excludedIds.length;

  const toggleReport = (reportId: string) => {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(reportId)) {
        next.delete(reportId);
      } else {
        next.add(reportId);
      }
      return [...next];
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          Отчёты
          <span className={styles.counter}>
            выбрано {selectedCount} из {reports.length}
          </span>
        </div>
        <VIconButton
          ariaLabel={isExpanded ? 'Скрыть отчёты' : 'Показать отчёты'}
          onClick={() => setIsExpanded((prev) => !prev)}
          color="var(--color-text-primary)"
        >
          {isExpanded ? (
            <EyeOffIcon size={24} color="currentColor" />
          ) : (
            <EyeIcon size={24} color="currentColor" />
          )}
        </VIconButton>
      </div>

      {isExpanded && (
        <div className={styles.buttonsWrap}>
          {reports.map((report) => {
            const isSelected = !excluded.has(report.id);
            return (
              <button
                key={report.id}
                type="button"
                onClick={() => toggleReport(report.id)}
                className={`${styles.button}${isSelected ? ` ${styles.buttonActive}` : ''}`}
              >
                {report.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};