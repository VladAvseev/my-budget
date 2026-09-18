import { CalendarIcon, ChevronRightIcon, PlusIcon } from '@/shared/icons';
import { useAuth } from '@/shared/api/authProvider';

import { VCard } from '@/shared/ui/VCard';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VButton } from '@/shared/ui/VButton';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VLoader } from '@/shared/ui/VLoader';
import { VSkeletonList } from '@/shared/ui/VSkeleton';
import { formatDisplay } from '@/shared/utils';
import { useAtom } from 'jotai';
import { Link } from 'react-router-dom';
import { useReports } from '../api/useReports';
import { createModalOpenAtom } from '../atoms/reports';
import styles from './ReportsList.module.css';

const pluralize = (count: number, one: string, few: string, many: string): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${count} ${few}`;
  return `${count} ${many}`;
};

const formatBudgetingBadge = (totalPeriods: number): string => {
  if (totalPeriods <= 0) return '';
  const years = Math.floor(totalPeriods / 12);
  const months = totalPeriods % 12;

  const parts: string[] = [];
  if (years > 0) {
    parts.push(pluralize(years, 'год', 'года', 'лет'));
  }
  if (months > 0) {
    parts.push(`${months} мес.`);
  }
  return parts.join(' ');
};

export const ReportsList = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [, setIsCreateOpen] = useAtom(createModalOpenAtom);
  const { data, isLoading, error, refetch, isFetching } = useReports(userId);

  const reports = data ?? [];

  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const years = [...new Set(reports.map((report) => report.period_start.slice(0, 4)))].sort(
    (a, b) => b.localeCompare(a),
  );

  const badgeText =
    !isLoading && !error && reports.length > 0 ? formatBudgetingBadge(reports.length) : null;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.left}>
          <h1 className={styles.srOnly}>Периоды</h1>
          {badgeText && (
            <span
              className={styles.durationBadge}
              title="Срок ведения учёта бюджета"
              aria-label={`Срок ведения учёта бюджета: ${badgeText}`}
            >
              <CalendarIcon size={16} aria-hidden="true" />
              <span>{badgeText}</span>
            </span>
          )}
        </div>
        <VIconButton
          variant="filled"
          ariaLabel="Добавить период"
          onClick={() => setIsCreateOpen(true)}
          isDisabled={isLoading}
        >
          <PlusIcon size={20} color="currentColor" />
        </VIconButton>
      </div>

      {error && !isLoading && (
        <VErrorCard
          title="Не удалось загрузить периоды"
          error={error}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      )}
      {isLoading && (
        <VSkeletonList count={4} cardProps={{ compact: true, title: false, lines: 2 }} />
      )}
      {!isLoading && !error && reports.length === 0 && (
        <VCard className={styles.emptyState}>
          <h2>Начните с первого месяца</h2>
          <p>Создайте период, чтобы записывать доходы и расходы и планировать бюджет.</p>
          <VButton onClick={() => setIsCreateOpen(true)}>Добавить период</VButton>
        </VCard>
      )}
      {!isLoading &&
        years.map((year) => (
          <section key={year} className={styles.yearGroup} aria-labelledby={`reports-year-${year}`}>
            <h2 id={`reports-year-${year}`} className={styles.year}>
              {year}
            </h2>
            <ul className={styles.list}>
              {reports
                .filter((report) => report.period_start.startsWith(year))
                .map((report) => {
                  const pending = Boolean((report as { _optimistic?: boolean })._optimistic);
                  const current =
                    report.period_start.slice(0, 10) <= localDate &&
                    report.period_end.slice(0, 10) >= localDate;
                  const content = (
                    <>
                      <span className={styles.titleInfo}>
                        {current && <span className={styles.currentLabel}>Текущий период</span>}
                        <span className={styles.title}>{report.name}</span>
                      </span>
                      <span className={styles.period}>
                        <time dateTime={report.period_start}>
                          {formatDisplay(report.period_start)}
                        </time>{' '}
                        —{' '}
                        <time dateTime={report.period_end}>{formatDisplay(report.period_end)}</time>
                      </span>
                      <span className={styles.chevron} aria-hidden="true">
                        {pending ? <VLoader size={18} /> : <ChevronRightIcon size={20} />}
                      </span>
                    </>
                  );
                  return (
                    <li key={report.id}>
                      {pending ? (
                        <div
                          className={styles.row}
                          data-current={current}
                          role="status"
                          aria-label={`${report.name}: создаётся`}
                          aria-busy="true"
                        >
                          {content}
                        </div>
                      ) : (
                        <Link
                          to={`/reports/${report.id}`}
                          className={styles.row}
                          data-current={current}
                        >
                          {content}
                        </Link>
                      )}
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
    </div>
  );
};
