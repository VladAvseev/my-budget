import { ChevronRightIcon, PlusIcon } from '@/shared/icons';
import { useAuth } from '@/shared/api/authProvider';

import { VCard } from '@/shared/ui/VCard';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VButton } from '@/shared/ui/VButton';
import { VLoader } from '@/shared/ui/VLoader';
import { VSkeletonList } from '@/shared/ui/VSkeleton';
import { VTextInput } from '@/shared/ui/VTextInput';
import { formatDisplay } from '@/shared/utils';
import { useAtom } from 'jotai';
import { Link } from 'react-router-dom';
import { useReports } from '../api/useReports';
import { createModalOpenAtom, searchQueryAtom } from '../atoms/reports';
import styles from './ReportsList.module.css';

export const ReportsList = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [, setIsCreateOpen] = useAtom(createModalOpenAtom);
  const { data, isLoading, error, refetch, isFetching } = useReports(userId);

  const reports = data ?? [];
  const filtered = searchQuery.trim()
    ? reports.filter(
        (report) =>
          report.code.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          report.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : reports;

  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const years = [...new Set(filtered.map((report) => report.period_start.slice(0, 4)))].sort(
    (a, b) => b.localeCompare(a),
  );

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <p className={styles.intro}>Доходы, расходы и бюджет — месяц за месяцем.</p>
        <VButton
          className={styles.createButton}
          onClick={() => setIsCreateOpen(true)}
          isDisabled={isLoading}
        >
          <PlusIcon size={20} color="currentColor" /> Создать период
        </VButton>
        <VTextInput
          type="search"
          aria-label="Поиск периодов по названию или коду"
          placeholder="Название или код периода"
          value={searchQuery}
          onChange={setSearchQuery}
          className={styles.searchInput}
        />
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
      {!isLoading && !error && (
        <p className={styles.resultCount} role="status">
          {searchQuery.trim() ? `Найдено: ${filtered.length}` : `Всего периодов: ${reports.length}`}
        </p>
      )}
      {!isLoading && !error && filtered.length === 0 && (
        <VCard className={styles.emptyState}>
          <h2>{reports.length === 0 ? 'Начните с первого месяца' : 'Периоды не найдены'}</h2>
          <p>
            {reports.length === 0
              ? 'Создайте период, чтобы записывать доходы и расходы и планировать бюджет.'
              : 'Попробуйте другое название или код периода.'}
          </p>
          <VButton
            variant="secondary"
            onClick={() => (reports.length === 0 ? setIsCreateOpen(true) : setSearchQuery(''))}
          >
            {reports.length === 0 ? 'Создать период' : 'Сбросить поиск'}
          </VButton>
        </VCard>
      )}
      {!isLoading &&
        years.map((year) => (
          <section key={year} className={styles.yearGroup} aria-labelledby={`reports-year-${year}`}>
            <h2 id={`reports-year-${year}`} className={styles.year}>
              {year}
            </h2>
            <ul className={styles.list}>
              {filtered
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
