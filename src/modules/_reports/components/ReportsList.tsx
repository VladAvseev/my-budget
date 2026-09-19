import { CalendarIcon, ChevronRightIcon } from '@/shared/icons';

import { VCard } from '@/shared/ui/VCard';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VSkeletonList } from '@/shared/ui/VSkeleton';
import { useOperationMonths } from '@/shared/api/hooks/useOperationMonths';
import { currentMonthCode, formatMonthTitle, monthYear } from '@/shared/utils';
import { Link } from 'react-router-dom';
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
  const { data, isLoading, error, refetch, isFetching } = useOperationMonths();

  const months = data ?? [];
  const currentMonth = currentMonthCode();
  const years = [...new Set(months.map((month) => monthYear(month)))].sort((a, b) =>
    b.localeCompare(a),
  );

  const badgeText = !isLoading && !error && months.length > 0 ? formatBudgetingBadge(months.length) : null;

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
      {!isLoading && !error && months.length === 0 && (
        <VCard className={styles.emptyState}>
          <h2>Операций пока нет</h2>
          <p>Добавьте первую операцию кнопкой «Добавить операцию», и месяц появится здесь.</p>
        </VCard>
      )}
      {!isLoading &&
        years.map((year) => (
          <section key={year} className={styles.yearGroup} aria-labelledby={`reports-year-${year}`}>
            <h2 id={`reports-year-${year}`} className={styles.year}>
              {year}
            </h2>
            <ul className={styles.list}>
              {months
                .filter((month) => month.startsWith(year))
                .map((month) => {
                  const current = month === currentMonth;
                  const content = (
                    <>
                      <span className={styles.titleInfo}>
                        {current && <span className={styles.currentLabel}>Текущий месяц</span>}
                        <span className={styles.title}>{formatMonthTitle(month)}</span>
                      </span>
                      <span className={styles.period}>
                        <time dateTime={month}>{formatMonthTitle(month)}</time>
                      </span>
                      <span className={styles.chevron} aria-hidden="true">
                        <ChevronRightIcon size={20} />
                      </span>
                    </>
                  );
                  return (
                    <li key={month}>
                      <Link to={`/reports/${month}`} className={styles.row} data-current={current}>
                        {content}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
    </div>
  );
};
