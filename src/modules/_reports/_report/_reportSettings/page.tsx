import commonStyles from '@/shared/styles/common.module.css';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { useNavigate, useParams } from 'react-router-dom';
import { useReport } from '../api/useReport';
import { CategoryLimitsCard } from './components/CategoryLimitsCard';
import { DailyExpensesCard } from './components/DailyExpensesCard';
import { RemoveReportCard } from './components/RemoveReportCard';

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading, error } = useReport(id ?? '');

  return (
    <div className={commonStyles.page}>
      <VPageHeader
        title={report ? `Настройки отчёта «${report.code || report.name}»` : 'Настройки отчёта'}
        onBack={() => navigate(`/reports/${id ?? ''}`)}
        backAriaLabel="Назад к отчёту"
      />

      {isLoading && (
        <div className={commonStyles.loaderContainer}>
          <VLoader size={28} />
        </div>
      )}

      {!isLoading && (error || !report) && (
        <VCard>
          <div className={commonStyles.textSecondary}>Отчёт не найден</div>
        </VCard>
      )}

      {!isLoading && !error && report && (
        <>
          <div className={commonStyles.animateCard}>
            <DailyExpensesCard report={report} />
          </div>
          <div className={commonStyles.animateCard} style={{ animationDelay: '0.06s' }}>
            <CategoryLimitsCard report={report} />
          </div>
          <div className={commonStyles.animateCard} style={{ animationDelay: '0.12s' }}>
            <RemoveReportCard report={report} />
          </div>
        </>
      )}
    </div>
  );
};