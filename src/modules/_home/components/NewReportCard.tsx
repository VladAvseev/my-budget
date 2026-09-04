import { ReportsIcon } from '@/shared/icons';
import { ChevronRightIcon } from '@/shared/icons';
import { useReports } from '../api/useReports';
import { VCard } from '@/shared/ui/VCard';
import { Link } from 'react-router-dom';
import { formatDisplay } from '@/shared/utils';
import styles from '../homeCard.module.css';

export const NewReportCard = () => {
  const { data: reports = [], isLoading } = useReports();

  if (isLoading || reports.length === 0) return null;

  const latestReport = reports.reduce((max, report) =>
    new Date(report.period_end) > new Date(max.period_end) ? report : max,
  );

  const latestPeriodEnd = latestReport.period_end;
  const isPeriodEnded = new Date() > new Date(latestPeriodEnd);

  if (!isPeriodEnded) return null;

  return (
    <Link to="/reports" className={`${styles.link} ${styles.animateCard}`}>
      <VCard interactive className={styles.card}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>
            <ReportsIcon size={18} />
          </span>
          <div className={styles.title}>Пришло время создать новый отчёт</div>
        </div>
        <div className={styles.subtitle}>
          Период последнего отчёта завершился {formatDisplay(latestPeriodEnd)}.
          Создайте новый отчёт для продолжения учёта.
        </div>
      </VCard>
      <span className={styles.chevron}>
        <ChevronRightIcon size={18} />
      </span>
    </Link>
  );
};