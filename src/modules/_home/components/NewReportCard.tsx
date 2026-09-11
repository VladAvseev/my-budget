import { useBootstrap } from '@/shared/api/hooks';
import { ChevronRightIcon, ReportsIcon } from '@/shared/icons';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { formatDisplay } from '@/shared/utils';
import { Link } from 'react-router-dom';
import styles from '../homeCard.module.css';

export const NewReportCard = () => {
  const { data } = useBootstrap();

  // «Последний» — тот же отчёт, что в LastReportCard: максимум по period_end.
  const lastReport = data?.lastReport ?? null;
  const latestPeriodEnd = lastReport?.period_end ?? null;

  if (!latestPeriodEnd) return null;

  const isPeriodEnded = new Date() > new Date(latestPeriodEnd);

  if (!isPeriodEnded) return null;

  return (
    <Link to="/reports" className={`${styles.link} ${styles.animateCard}`}>
      <VCard interactive className={styles.card}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>
            <ReportsIcon size={18} />
          </span>
          <div className={styles.title}>Пришло время добавить новый период</div>
        </div>
        <div className={styles.subtitle}>
          Последний периода завершился {formatDisplay(latestPeriodEnd)}. Добавьте новый период для
          продолжения учёта.
        </div>
        <VButton className={styles.fullWidthButton}>Добавить период</VButton>
      </VCard>
      <span className={styles.chevron}>
        <ChevronRightIcon size={18} />
      </span>
    </Link>
  );
};
