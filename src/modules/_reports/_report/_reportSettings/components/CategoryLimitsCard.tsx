import { ImportIcon, TrashIcon } from '@/shared/icons';
import { createOptimisticId } from '@/shared/optimistic';
import { useAuth } from '@/shared/supabase/authProvider';
import type { Report } from '@/shared/supabase/types/domain';
import { getErrorMessage } from '@/shared/utils';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VCategoryDot } from '@/shared/ui/VCategoryDot';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VLoader } from '@/shared/ui/VLoader';
import { VSelect, type VSelectOption } from '@/shared/ui/VSelect';
import { VTextInput } from '@/shared/ui/VTextInput';
import { useMemo, useState } from 'react';
import type { CategoryLimit } from '@/shared/supabase/types/domain';
import { useCategories } from '../../api/useCategories';
import { useCategoryLimits } from '../../api/useCategoryLimits';
import { useSetCategoryLimits } from '../api/useSetCategoryLimits';
import { ImportLimitsModal } from './ImportLimitsModal';
import styles from '../settingsCard.module.css';

interface CategoryLimitsCardProps {
  report: Report;
}

interface LimitDraft {
  id: string;
  categoryId: string;
  amount: string;
}

const createEmptyDraft = (): LimitDraft => ({
  id: createOptimisticId(),
  categoryId: '',
  amount: '',
});

const mapLimitsToDraft = (limits: CategoryLimit[]): LimitDraft[] =>
  limits.map((limit) => ({
    id: limit.id,
    categoryId: limit.category_id,
    amount: limit.amount,
  }));

export const CategoryLimitsCard = ({ report }: CategoryLimitsCardProps) => {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const limitsQuery = useCategoryLimits(report.id);
  const categoriesQuery = useCategories(userId, 'expense');
  const setLimits = useSetCategoryLimits(report.id);

  const [draftLimits, setDraftLimits] = useState<LimitDraft[]>(() =>
    mapLimitsToDraft(limitsQuery.data ?? []),
  );
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>();
  const [isSaved, setIsSaved] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const [prevLimitsData, setPrevLimitsData] = useState(limitsQuery.data);

  if (limitsQuery.data !== prevLimitsData) {
    setPrevLimitsData(limitsQuery.data);
    setDraftLimits(mapLimitsToDraft(limitsQuery.data ?? []));
    setRowErrors({});
  }

  const addLimit = () => {
    setDraftLimits((prev) => [...prev, createEmptyDraft()]);
    setIsSaved(false);
  };

  const updateLimit = (
    rowId: string,
    patch: Partial<Pick<LimitDraft, 'categoryId' | 'amount'>>,
  ) => {
    setDraftLimits((prev) =>
      prev.map((limit) => (limit.id === rowId ? { ...limit, ...patch } : limit)),
    );
    setRowErrors((prev) => {
      if (!prev[rowId]) return prev;
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
    setIsSaved(false);
  };

  const removeLimit = (rowId: string) => {
    setDraftLimits((prev) => prev.filter((limit) => limit.id !== rowId));
    setIsSaved(false);
  };

  const optionsByRow = useMemo(() => {
    const base: VSelectOption[] = categories.map((category) => ({
      value: category.id,
      label: category.name,
      ...(category.color ? { prefix: <VCategoryDot color={category.color} /> } : {}),
    }));
    return draftLimits.map((row) => {
      const used = new Set(
        draftLimits.filter((limit) => limit.id !== row.id).map((limit) => limit.categoryId),
      );
      return base.filter((option) => option.value === '' || !used.has(option.value));
    });
  }, [draftLimits, categories]);

  const handleSave = () => {
    setSubmitError(undefined);
    setIsSaved(false);

    const nextErrors: Record<string, string> = {};
    let isValid = true;
    const seenCategories = new Set<string>();
    for (const limit of draftLimits) {
      const parts: string[] = [];
      if (!limit.categoryId) {
        parts.push('выберите категорию');
        isValid = false;
      } else if (seenCategories.has(limit.categoryId)) {
        parts.push('категория уже используется');
        isValid = false;
      } else {
        seenCategories.add(limit.categoryId);
      }
      const amountValue = Number(limit.amount);
      if (!limit.amount || Number.isNaN(amountValue) || amountValue <= 0) {
        parts.push('укажите положительную сумму');
        isValid = false;
      }
      if (parts.length > 0) {
        nextErrors[limit.id] = parts
          .map((part) => part[0].toUpperCase() + part.slice(1))
          .join(', ');
      }
    }
    setRowErrors(nextErrors);
    if (!isValid) {
      return;
    }

    setLimits.mutate(
      draftLimits.map((limit) => ({
        reportId: report.id,
        categoryId: limit.categoryId,
        amount: Number(limit.amount),
      })),
      {
        onSuccess: () => setIsSaved(true),
        onError: (error: Error) => setSubmitError(getErrorMessage(error)),
      },
    );
  };

  const handleCancel = () => {
    setDraftLimits(mapLimitsToDraft(limitsQuery.data ?? []));
    setRowErrors({});
    setSubmitError(undefined);
    setIsSaved(false);
  };

  const isDirty = useMemo(() => {
    const data = limitsQuery.data;
    if (!data) return false;
    const signature = (limits: { categoryId: string; amount: string }[]) =>
      limits
        .map((limit) => `${limit.categoryId}:${Number(limit.amount) || 0}`)
        .sort()
        .join('|');
    return (
      signature(draftLimits) !==
      signature(data.map((limit) => ({ categoryId: limit.category_id, amount: limit.amount })))
    );
  }, [draftLimits, limitsQuery.data]);

  const isLoading = limitsQuery.isLoading || categoriesQuery.isLoading;
  const isEmpty = draftLimits.length === 0;

  return (
    <VCard>
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <div className={styles.title}>Бюджет</div>
          <VIconButton
            ariaLabel="Импортировать лимиты"
            onClick={() => setIsImportOpen(true)}
            color="var(--color-accent)"
          >
            <ImportIcon size={24} color="currentColor" />
          </VIconButton>
        </div>

        <div className={styles.text}>
          Установите максимальную сумму расходов по категориям на вкладке «Расходы».
        </div>

        {limitsQuery.error && (
          <VBanner type="error" visible message="Не удалось загрузить лимиты" />
        )}
        {categoriesQuery.error && (
          <VBanner type="error" visible message="Не удалось загрузить категории" />
        )}
        {submitError && <VBanner type="error" visible message={submitError} />}
        {isSaved && !submitError && <VBanner type="success" visible message="Бюджет сохранён" />}

        {isLoading && (
          <div className={styles.loaderWrap}>
            <VLoader size={28} />
          </div>
        )}

        {!isLoading && isEmpty && (
          <div className={styles.text}>
            Бюджет — это плановый лимит расходов на категорию в рамках периода.
            <br />
            Нажмите «Добавить» или импортируйте из других периодов.
          </div>
        )}

        {!isLoading &&
          draftLimits.map((limit, index) => (
            <div key={limit.id} className={styles.fieldGroupTop}>
              <div className={styles.fieldGrow}>
                <VSelect
                  options={optionsByRow[index]}
                  value={limit.categoryId}
                  error={rowErrors[limit.id]}
                  disabled={setLimits.isPending}
                  onChange={(value) => updateLimit(limit.id, { categoryId: value })}
                />
              </div>
              <div className={styles.fieldFixed}>
                <VTextInput
                  numeric
                  placeholder="0.00"
                  value={limit.amount}
                  error={rowErrors[limit.id]}
                  disabled={setLimits.isPending}
                  onChange={(value) => updateLimit(limit.id, { amount: value })}
                />
              </div>
              <VIconButton
                ariaLabel="Удалить лимит"
                onClick={() => removeLimit(limit.id)}
                isDisabled={setLimits.isPending}
                color="var(--color-error)"
              >
                <TrashIcon size={24} color="currentColor" />
              </VIconButton>
            </div>
          ))}

        {!isLoading && (
          <div>
            <VButton variant="secondary" onClick={addLimit} isDisabled={setLimits.isPending}>
              Добавить
            </VButton>
          </div>
        )}

        <div className={styles.rowEndGap}>
          <VButton
            variant="secondary"
            onClick={handleCancel}
            isDisabled={!isDirty || setLimits.isPending}
          >
            Отмена
          </VButton>
          <VButton
            onClick={handleSave}
            isLoading={setLimits.isPending}
            isDisabled={!isDirty || isLoading}
          >
            Сохранить
          </VButton>
        </div>
      </div>

      <ImportLimitsModal
        report={report}
        visible={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </VCard>
  );
};