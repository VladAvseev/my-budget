import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStyles } from '@/shared/theme';
import type { Report } from '@/shared/supabase/services/reports';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VConfirmModal } from '@/shared/ui/VConfirmModal';
import { useRemoveReport } from '../api/useRemoveReport';

interface RemoveReportCardProps {
  report: Report;
}

export const RemoveReportCard = ({ report }: RemoveReportCardProps) => {
  const styles = useThemeStyles();
  const navigate = useNavigate();
  const removeReport = useRemoveReport(report.id);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const handleConfirm = () => {
    setSubmitError(undefined);
    removeReport.mutate(undefined, {
      onSuccess: () => navigate('/reports'),
      onError: (error: Error) => setSubmitError(error.message),
    });
  };

  return (
    <VCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.l }}>
        <div
          style={{
            fontSize: styles.typography.fontSize.xl,
            fontWeight: styles.typography.fontWeight.bold,
            color: styles.colors.textPrimary,
          }}
        >
          Удаление отчёта
        </div>
        <div style={{ color: styles.colors.textSecondary }}>
          Отчёт «{report.name}» и все его операции будут безвозвратно удалены.
        </div>
        {submitError && <VBanner type="error" visible message={submitError} />}
        <div>
          <VButton variant="danger" onClick={() => setIsConfirmOpen(true)}>
            Удалить отчёт
          </VButton>
        </div>
      </div>

      <VConfirmModal
        visible={isConfirmOpen}
        title="Удалить отчёт"
        message={`Удалить отчёт «${report.name}»? Это действие нельзя отменить.`}
        confirmLabel="Удалить"
        isLoading={removeReport.isPending}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
      />
    </VCard>
  );
};