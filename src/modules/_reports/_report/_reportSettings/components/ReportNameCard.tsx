import { useState } from 'react';
import type { Report } from '@/shared/supabase/services/reports';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VTextInput } from '@/shared/ui/VTextInput';
import { useUpdateReport } from '../api/useUpdateReport';
import styles from '../settingsCard.module.css';

interface ReportNameCardProps {
  report: Report;
}

export const ReportNameCard = ({ report }: ReportNameCardProps) => {
  const updateReport = useUpdateReport(report.id);

  const [name, setName] = useState(report.name);
  const [nameError, setNameError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError('Укажите название отчёта');
      setIsSaved(false);
      return;
    }
    setNameError(undefined);
    setSubmitError(undefined);
    setIsSaved(false);
    updateReport.mutate(
      { name: name.trim() },
      {
        onSuccess: () => setIsSaved(true),
        onError: (error: Error) => setSubmitError(error.message),
      },
    );
  };

  return (
    <VCard>
      <div className={styles.content}>
        <div className={styles.title}>Название отчёта</div>

        {isSaved && !submitError && <VBanner type="success" visible message="Название сохранено" />}
        {submitError && <VBanner type="error" visible message={submitError} />}

        <div className={styles.fieldGroup}>
          <div className={styles.fieldGrow}>
            <VTextInput
              label="Название"
              placeholder="Например, Август 2026"
              value={name}
              error={nameError}
              disabled={updateReport.isPending}
              onChange={(value) => {
                setName(value);
                setNameError(undefined);
                setIsSaved(false);
              }}
            />
          </div>
          <VButton onClick={handleSubmit} isLoading={updateReport.isPending}>
            Сохранить
          </VButton>
        </div>
      </div>
    </VCard>
  );
};