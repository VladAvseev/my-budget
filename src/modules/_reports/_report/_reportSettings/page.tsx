import layout from '../../reports.module.css';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import commonStyles from '@/shared/styles/common.module.css';
import { VCard } from '@/shared/ui/VCard';
import { VSkeletonCard } from '@/shared/ui/VSkeleton';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { useNavigate, useParams } from 'react-router-dom';
import { useReport } from '../api/useReport';
import { CategoryLimitsCard } from './components/CategoryLimitsCard';
import { RemoveReportCard } from './components/RemoveReportCard';

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading, error, refetch, isFetching } = useReport(id ?? '');

  return (
    <div className={layout.page}>
      <VPageHeader
        title={report ? `Настройки периода «${report.name}»` : 'Настройки периода'}
        onBack={() => navigate(`/reports/${id ?? ''}`)}
        backAriaLabel="Назад к периоду"
      />

      {isLoading && (
        <>
          <VSkeletonCard compact delay="0s" />
          <VSkeletonCard compact delay="0.06s" />
          <VSkeletonCard compact delay="0.12s" lines={2} />
        </>
      )}

      {error && (
        <VErrorCard
          title="Не удалось загрузить период"
          error={error}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      )}
      {!isLoading && !error && !report && (
        <VCard>
          <div className={commonStyles.textSecondary}>Период не найден</div>
        </VCard>
      )}

      {!isLoading && !error && report && (
        <div className={layout.settings}>
          <section aria-label="Бюджет периода">
            <CategoryLimitsCard report={report} />
          </section>
          <aside aria-label="Удаление периода">
            <RemoveReportCard report={report} />
          </aside>
        </div>
      )}
    </div>
  );
};
