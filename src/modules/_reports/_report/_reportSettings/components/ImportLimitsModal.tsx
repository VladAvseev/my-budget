import { useAuth } from '@/shared/supabase/authProvider';
import type { Report } from '@/shared/supabase/services/reports';
import { useThemeStyles } from '@/shared/theme';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VLoader } from '@/shared/ui/VLoader';
import { VModal } from '@/shared/ui/VModal';
import { VSelect } from '@/shared/ui/VSelect';
import { formatAmount } from '@/shared/utils';
import { useMemo, useState } from 'react';
import { useReports } from '../../../api/useReports';
import { useCategoryLimits } from '../../api/useCategoryLimits';
import { useCategories } from '../../api/useCategories';
import { useSetCategoryLimits } from '../api/useSetCategoryLimits';

interface ImportLimitsModalProps {
  report: Report;
  visible: boolean;
  onClose: () => void;
}

export const ImportLimitsModal = ({ report, visible, onClose }: ImportLimitsModalProps) => {
  const styles = useThemeStyles();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const reportsQuery = useReports();
  const categoriesQuery = useCategories(userId, 'expense');
  const setLimits = useSetCategoryLimits(report.id, userId);

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
        onError: (error: Error) => setSubmitError(error.message),
      },
    );
  };

  return (
    <VModal
      visible={visible}
      title="Импорт лимитов"
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.l }}>
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
          <div style={{ color: styles.colors.textSecondary }}>
            Выберите отчёт, чтобы посмотреть его лимиты. Они полностью заменят текущие лимиты отчёта
            «{report.name}».
          </div>
        )}

        {hasSelection && sourceLimitsQuery.isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: styles.spacing.xl }}>
            <VLoader size={28} />
          </div>
        )}

        {hasSelection && sourceLimitsQuery.error && (
          <VBanner type="error" visible message="Не удалось загрузить лимиты отчёта" />
        )}

        {hasSelection && !sourceLimitsQuery.isLoading && !sourceLimitsQuery.error && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: styles.spacing.m,
              padding: styles.spacing.m,
              borderRadius: styles.radius.m,
              border: `1px solid ${styles.colors.border}`,
              backgroundColor: styles.colors.bgSurface,
            }}
          >
            <div
              style={{
                fontSize: styles.typography.fontSize.s,
                fontWeight: styles.typography.fontWeight.medium,
                color: styles.colors.textSecondary,
              }}
            >
              Лимиты выбранного отчёта
            </div>
            {sourceLimits.length === 0 && (
              <div style={{ color: styles.colors.textSecondary }}>
                У выбранного отчёта нет лимитов.
              </div>
            )}
            {sourceLimits.map((limit) => {
              const category = categoriesById.get(limit.category_id);
              return (
                <div
                  key={limit.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: styles.spacing.m,
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: styles.spacing.s,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        flexShrink: 0,
                        borderRadius: styles.radius.round,
                        backgroundColor: category?.color ?? styles.colors.border,
                      }}
                    />
                    <span
                      style={{
                        color: styles.colors.textPrimary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {category?.name ?? 'Категория удалена'}
                    </span>
                  </span>
                  <span style={{ fontWeight: styles.typography.fontWeight.bold, flexShrink: 0 }}>
                    {formatAmount(Number(limit.amount))}
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
