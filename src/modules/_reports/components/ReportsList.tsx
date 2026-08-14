import { useAtom } from 'jotai';
import { Link } from 'react-router-dom';
import { useThemeStyles } from '@/shared/theme';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { VTextInput } from '@/shared/ui/VTextInput';
import { formatDisplay } from '@/shared/utils';
import { useReports } from '../api/useReports';
import { searchQueryAtom } from '../atoms/reports';

export const ReportsList = () => {
  const styles = useThemeStyles();
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const { data, isLoading, error } = useReports();

  const reports = data ?? [];
  const filtered = searchQuery.trim()
    ? reports.filter((report) =>
        report.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : reports;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.l }}>
      <VTextInput
        label="Поиск"
        placeholder="Поиск по названию"
        value={searchQuery}
        onChange={setSearchQuery}
      />

      {error && (
        <VBanner type="error" visible message="Не удалось загрузить отчёты" />
      )}

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: styles.spacing.xl }}>
          <VLoader size={28} />
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <VCard>
          <div style={{ color: styles.colors.textSecondary }}>
            {reports.length === 0
              ? 'Нет созданных отчётов'
              : 'Ничего не найдено'}
          </div>
        </VCard>
      )}

      {!isLoading &&
        filtered.map((report) => {
          const isOptimistic = Boolean((report as { _optimistic?: boolean })._optimistic);

          const content = (
            <>
              <div
                style={{
                  fontSize: styles.typography.fontSize.l,
                  fontWeight: styles.typography.fontWeight.bold,
                  color: styles.colors.textPrimary,
                }}
              >
                {report.name}
              </div>
              {report.has_daily_expenses && (
                <div
                  style={{
                    fontSize: styles.typography.fontSize.s,
                    color: styles.colors.textSecondary,
                  }}
                >
                  {report.period_start && report.period_end
                    ? ` ${formatDisplay(report.period_start)} – ${formatDisplay(report.period_end)}`
                    : ''}
                </div>
              )}
            </>
          );

          if (isOptimistic) {
            return (
              <VCard
                key={report.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: styles.spacing.m,
                }}
              >
                {content}
                <VLoader size={16} />
              </VCard>
            );
          }

          return (
            <Link
              key={report.id}
              to={`/reports/${report.id}`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <VCard
                interactive
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                {content}
              </VCard>
            </Link>
          );
        })}
    </div>
  );
};