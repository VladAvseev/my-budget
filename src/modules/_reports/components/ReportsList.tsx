import { ChevronRightIcon, PlusIcon } from '@/shared/icons';
import { useAuth } from '@/shared/api/authProvider';
import commonStyles from '@/shared/styles/common.module.css';
import { VCard } from '@/shared/ui/VCard';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VIconButton } from '@/shared/ui/VIconButton';
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

  const renderContent = (report: (typeof reports)[number]) => (
    <div className={styles.titleInfo}>
      <div className={styles.title}>{report.name}</div>
      <div className={styles.period}>
        {' ' + formatDisplay(report.period_start) + ' – ' + formatDisplay(report.period_end)}
      </div>
    </div>
  );

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <VTextInput
          placeholder="Поиск по названию"
          value={searchQuery}
          onChange={setSearchQuery}
          className={styles.searchInput}
        />
        <VIconButton
          ariaLabel="Добавить период"
          onClick={() => setIsCreateOpen(true)}
          isDisabled={isLoading}
          color="var(--color-accent)"
          className={styles.addButton}
        >
          <PlusIcon size={24} color="currentColor" />
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
        <VSkeletonList
          count={4}
          cardProps={{ compact: true, title: false, lines: 2 }}
          style={{ gap: 'var(--space-l)' }}
        />
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <VCard>
          <div className={styles.emptyState}>
            {reports.length === 0 ? (
              <>
                <div className={styles.emptyTitle}>
                  Период — это временной контейнер, за который вы фиксируете доходы, расходы и
                  накопления.
                </div>
                <div className={styles.emptyHint}>Нажмите «+», чтобы добавить первый период.</div>
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
