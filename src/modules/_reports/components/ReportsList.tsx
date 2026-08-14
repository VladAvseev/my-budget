import { useAtom } from 'jotai';
import { Link } from 'react-router-dom';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { VTextInput } from '@/shared/ui/VTextInput';
import { formatDisplay } from '@/shared/utils';
import { useReports } from '../api/useReports';
import { searchQueryAtom } from '../atoms/reports';
import styles from './ReportsList.module.css';

export const ReportsList = () => {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const { data, isLoading, error } = useReports();

  const reports = data ?? [];
  const filtered = searchQuery.trim()
    ? reports.filter((report) =>
        report.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : reports;

  return (
    <div className={styles.root}>
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
        <div className={styles.loaderWrap}>
          <VLoader size={28} />
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <VCard>
          <div className={styles.empty}>
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
              <div className={styles.title}>{report.name}</div>
              {report.has_daily_expenses && (
                <div className={styles.period}>
                  {report.period_start && report.period_end
                    ? ` ${formatDisplay(report.period_start)} – ${formatDisplay(report.period_end)}`
                    : ''}
                </div>
              )}
            </>
          );

          if (isOptimistic) {
            return (
              <VCard key={report.id} className={styles.cardRow}>
                {content}
                <VLoader size={16} />
              </VCard>
            );
          }

          return (
            <Link
              key={report.id}
              to={`/reports/${report.id}`}
              className={styles.link}
            >
              <VCard interactive className={styles.cardRowAlignStart}>
                {content}
              </VCard>
            </Link>
          );
        })}
    </div>
  );
};