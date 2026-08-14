import { EyeIcon, EyeOffIcon } from '@/shared/icons';
import type { Report } from '@/shared/supabase/services/reports';
import { useThemeStyles } from '@/shared/theme';
import { VIconButton } from '@/shared/ui/VIconButton';
import { useAtom } from 'jotai';
import { excludedReportIdsAtom, tabsExpandedAtom } from '../atoms/overview';

interface OverviewTabsProps {
  reports: Report[];
}

export const OverviewTabs = ({ reports }: OverviewTabsProps) => {
  const styles = useThemeStyles();
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.m }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: styles.spacing.m,
        }}
      >
        <div
          style={{
            fontSize: styles.typography.fontSize.l,
            fontWeight: styles.typography.fontWeight.bold,
            color: styles.colors.textPrimary,
          }}
        >
          Отчёты
          <span
            style={{
              marginLeft: styles.spacing.s,
              fontSize: styles.typography.fontSize.m,
              fontWeight: styles.typography.fontWeight.regular,
              color: styles.colors.textSecondary,
            }}
          >
            выбрано {selectedCount} из {reports.length}
          </span>
        </div>
        <VIconButton
          ariaLabel={isExpanded ? 'Скрыть отчёты' : 'Показать отчёты'}
          onClick={() => setIsExpanded((prev) => !prev)}
          color={styles.colors.textPrimary}
        >
          {isExpanded ? (
            <EyeOffIcon size={24} color={styles.colors.textPrimary} />
          ) : (
            <EyeIcon size={24} color={styles.colors.textPrimary} />
          )}
        </VIconButton>
      </div>

      {isExpanded && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: styles.spacing.s,
          }}
        >
          {reports.map((report) => {
            const isSelected = !excluded.has(report.id);
            return (
              <button
                key={report.id}
                type="button"
                onClick={() => toggleReport(report.id)}
                style={{
                  padding: `${styles.spacing.s} ${styles.spacing.m}`,
                  borderRadius: styles.radius.m,
                  border: `1px solid ${isSelected ? styles.colors.accent : styles.colors.border}`,
                  backgroundColor: isSelected ? styles.colors.accentLight : styles.colors.bgSurface,
                  fontSize: styles.typography.fontSize.m,
                  fontWeight: isSelected
                    ? styles.typography.fontWeight.medium
                    : styles.typography.fontWeight.regular,
                  color: isSelected ? styles.colors.accent : styles.colors.textSecondary,
                  cursor: 'pointer',
                  transition:
                    'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                }}
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
