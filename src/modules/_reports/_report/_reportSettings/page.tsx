import { useThemeStyles } from '@/shared/theme';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { useNavigate, useParams } from 'react-router-dom';
import { useReport } from '../api/useReport';
import { CategoryLimitsCard } from './components/CategoryLimitsCard';
import { DailyExpensesCard } from './components/DailyExpensesCard';
import { RemoveReportCard } from './components/RemoveReportCard';
import { ReportNameCard } from './components/ReportNameCard';

export const Page: React.FC = () => {
  const styles = useThemeStyles();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading, error } = useReport(id ?? '');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: styles.spacing.l,
      }}
    >
      <VPageHeader
        title={report ? `Настройки отчёта «${report.name}»` : 'Настройки отчёта'}
        onBack={() => navigate(`/reports/${id ?? ''}`)}
        backAriaLabel="Назад к отчёту"
      />

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: styles.spacing.xl }}>
          <VLoader size={28} />
        </div>
      )}

      {!isLoading && (error || !report) && (
        <VCard>
          <div style={{ color: styles.colors.textSecondary }}>Отчёт не найден</div>
        </VCard>
      )}

      {!isLoading && !error && report && (
        <>
          <ReportNameCard report={report} />
          <DailyExpensesCard report={report} />
          <CategoryLimitsCard report={report} />
          <RemoveReportCard report={report} />
        </>
      )}
    </div>
  );
};
