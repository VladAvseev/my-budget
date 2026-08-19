import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Report } from '@/shared/supabase/services/reports';
import { getErrorMessage } from '@/shared/utils';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VConfirmModal } from '@/shared/ui/VConfirmModal';
import { useRemoveReport } from '../api/useRemoveReport';
import styles from '../settingsCard.module.css';

interface RemoveReportCardProps {
  report: Report;
}

export const RemoveReportCard = ({ report }: RemoveReportCardProps) => {
  const navigate = useNavigate();
  const removeReport = useRemoveReport(report.id);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const handleConfirm = () => {
    setSubmitError(undefined);
    removeReport.mutate(undefined, {
      onSuccess: () => navigate('/reports'),
      onError: (error: Error) => setSubmitError(getErrorMessage(error)),
    });
  };

  return (
    <VCard className={styles.dangerZone}>
      <div className={styles.content}>
        <div className={styles.title}>Удаление отчёта</div>
        <div className={styles.text}>
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