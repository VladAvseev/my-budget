import { useAtom } from 'jotai';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@/shared/icons';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { VTextInput } from '@/shared/ui/VTextInput';
import { formatDisplay } from '@/shared/utils';
import commonStyles from '@/shared/styles/common.module.css';
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

  const renderContent = (report: (typeof reports)[number]) => (
    <div className={styles.titleInfo}>
      <div className={styles.title}>{report.name}</div>
      {report.has_daily_expenses && (
        <div className={styles.period}>
          {report.period_start && report.period_end
            ? ` ${formatDisplay(report.period_start)} – ${formatDisplay(report.period_end)}`
            : ''}
        </div>
      )}
    </div>
  );

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
          <div className={styles.emptyState}>
            {reports.length === 0 ? (
              <>
                <div className={styles.emptyTitle}>Нет созданных отчётов</div>
                <div className={styles.emptyHint}>Нажмите «+», чтобы создать первый отчёт.</div>
              </>
            ) : (
              <>
                <div className={styles.emptyTitle}>Ничего не найдено</div>
                <div className={styles.emptyHint}>Измените запрос поиска.</div>
              </>
            )}
          </div>
        </VCard>
      )}

      {!isLoading &&
        filtered.map((report, index) => {
          const isOptimistic = Boolean((report as { _optimistic?: boolean })._optimistic);

          if (isOptimistic) {
            return (
              <VCard
                key={report.id}
                className={`${styles.cardRow} ${commonStyles.animateCard}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {renderContent(report)}
                <VLoader size={16} />
              </VCard>
            );
          }

          return (
            <Link
              key={report.id}
              to={`/reports/${report.id}`}
              className={`${styles.link} ${commonStyles.animateCard}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <VCard interactive className={styles.cardRowAlignStart}>
                {renderContent(report)}
              </VCard>
              <span className={styles.chevron}>
                <ChevronRightIcon size={18} />
              </span>
            </Link>
          );
        })}
    </div>
  );
};