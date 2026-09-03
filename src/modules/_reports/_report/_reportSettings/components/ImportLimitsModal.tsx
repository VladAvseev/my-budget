import { useAuth } from '@/shared/supabase/authProvider';
import type { Report } from '@/shared/supabase/types/domain';
import modalStyles from '@/shared/styles/modal.module.css';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VLoader } from '@/shared/ui/VLoader';
import { VModal } from '@/shared/ui/VModal';
import { VSelect } from '@/shared/ui/VSelect';
import { formatAmount, getErrorMessage } from '@/shared/utils';
import { useCurrency } from '@/shared/hooks';
import { useMemo, useState } from 'react';
import { useReports } from '../../../api/useReports';
import { useCategoryLimits } from '../../api/useCategoryLimits';
import { useCategories } from '../../api/useCategories';
import { useSetCategoryLimits } from '../api/useSetCategoryLimits';
import settingsStyles from '../settingsCard.module.css';

interface ImportLimitsModalProps {
  report: Report;
  visible: boolean;
  onClose: () => void;
}

export const ImportLimitsModal = ({ report, visible, onClose }: ImportLimitsModalProps) => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const currency = useCurrency();

  const reportsQuery = useReports();
  const categoriesQuery = useCategories(userId, 'expense');
  const setLimits = useSetCategoryLimits(report.id);

  const [selectedReportId, setSelectedReportId] = useState('');
  const [submitError, setSubmitError] = useState<string>();
  const sourceLimitsQuery = useCategoryLimits(selectedReportId);
  const [prevVisible, setPrevVisible] = useState(visible);

  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      setSelectedReportId('');
      setSubmitError(undefined);
    }
  }

  const reports = useMemo(
    () => (reportsQuery.data ?? []).filter((item) => item.id !== report.id),
    [reportsQuery.data, report.id],
  );

  const reportOptions = useMemo(
    () => reports.map((item) => ({ value: item.id, label: item.name })),
    [reports],
  );

  const categoriesById = useMemo(
    () => new Map((categoriesQuery.data ?? []).map((category) => [category.id, category])),
    [categoriesQuery.data],
  );

  const sourceLimits = sourceLimitsQuery.data ?? [];
  const hasSelection = selectedReportId !== '';

  const handleSave = () => {
    if (!hasSelection) return;
    setSubmitError(undefined);
    setLimits.mutate(
      sourceLimits.map((limit) => ({
        reportId: report.id,
        categoryId: limit.category_id,
        amount: Number(limit.amount),
      })),
      {
        onSuccess: onClose,
        onError: (error: Error) => setSubmitError(getErrorMessage(error)),
      },
    );
  };

  return (
    <VModal
      visible={visible}
      title="Импорт бюджета"
      onClose={onClose}
      error={submitError}
      width="520px"
      footer={
        <>
          <VButton variant="secondary" onClick={onClose} isDisabled={setLimits.isPending}>
            Отмена
          </VButton>
          <VButton onClick={handleSave} isLoading={setLimits.isPending} isDisabled={!hasSelection}>
            Сохранить
          </VButton>
        </>
      }
    >
      <div className={modalStyles.content}>
        <VSelect
          label="Отчёт"
          options={reportOptions}
          value={selectedReportId}
          placeholder="Выберите отчёт"
          disabled={setLimits.isPending}
          onChange={(value) => {
            setSelectedReportId(value);
            setSubmitError(undefined);
          }}
        />

        {!hasSelection && (
          <div className={settingsStyles.text}>
            Выберите отчёт, чтобы посмотреть его бюджет. Он полностью заменит текущий бюджет отчёта
            «{report.name}».
          </div>
        )}

        {hasSelection && sourceLimitsQuery.isLoading && (
          <div className={settingsStyles.loaderWrap}>
            <VLoader size={28} />
          </div>
        )}

        {hasSelection && sourceLimitsQuery.error && (
          <VBanner type="error" visible message="Не удалось загрузить бюджет отчёта" />
        )}

        {hasSelection && !sourceLimitsQuery.isLoading && !sourceLimitsQuery.error && (
          <div className={settingsStyles.importBox}>
            <div className={settingsStyles.importLabel}>Бюджет выбранного отчёта</div>
            {sourceLimits.length === 0 && (
              <div className={settingsStyles.text}>
                У выбранного отчёта нет бюджета.
              </div>
            )}
            {sourceLimits.map((limit) => {
              const category = categoriesById.get(limit.category_id);
              return (
                <div key={limit.id} className={settingsStyles.importRow}>
                  <span className={settingsStyles.importName}>
                    <span
                      className={settingsStyles.importDot}
                      style={{ backgroundColor: category?.color ?? 'var(--color-border)' }}
                    />
                    <span className={settingsStyles.importLabelText}>
                      {category?.name ?? 'Категория удалена'}
                    </span>
                  </span>
                  <span className={settingsStyles.importAmount}>
                    {formatAmount(Number(limit.amount), currency?.symbol)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </VModal>
  );
};