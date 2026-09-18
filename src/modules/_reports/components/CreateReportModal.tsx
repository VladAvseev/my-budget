import { useAtom } from 'jotai';
import React, { useMemo } from 'react';
import { useAuth } from '@/shared/api/authProvider';
import modalStyles from '@/shared/styles/modal.module.css';
import { getErrorMessage, formatDisplay } from '@/shared/utils';
import {
  buildCode,
  buildName,
  buildPeriodDates,
  MONTHS_RU,
  MIN_YEAR,
  MAX_YEAR,
} from '@/shared/utils/monthMapping';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VModal } from '@/shared/ui/VModal';
import { VSelect, type VSelectOption } from '@/shared/ui/VSelect';
import { ChevronLeftIcon, ChevronRightIcon } from '@/shared/icons';
import { useCreateReport } from '../api/useCreateReport';
import { useReports } from '../api/useReports';
import { selectedMonthAtom, selectedYearAtom } from '../atoms/reports';
import styles from './CreateReportModal.module.css';

interface CreateReportModalProps {
  visible: boolean;
  onClose: () => void;
}

const MONTH_OPTIONS: VSelectOption[] = MONTHS_RU.map((name, index) => ({
  value: String(index),
  label: name,
}));

const YEAR_OPTIONS: VSelectOption[] = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => {
  const year = MIN_YEAR + i;
  return { value: String(year), label: String(year) };
});

export const CreateReportModal = ({ visible, onClose }: CreateReportModalProps) => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [selectedMonth, setSelectedMonth] = useAtom(selectedMonthAtom);
  const [selectedYear, setSelectedYear] = useAtom(selectedYearAtom);

  const [submitError, setSubmitError] = React.useState<string>();

  const create = useCreateReport();
  const reportsQuery = useReports(userId);

  const code = useMemo(() => buildCode(selectedMonth, selectedYear), [selectedMonth, selectedYear]);
  const name = useMemo(() => buildName(selectedMonth, selectedYear), [selectedMonth, selectedYear]);
  const { periodStart, periodEnd } = useMemo(
    () => buildPeriodDates(selectedMonth, selectedYear),
    [selectedMonth, selectedYear],
  );

  const codeExists = useMemo(
    () =>
      (reportsQuery.data ?? []).some(
        (report) =>
          !(report as { _optimistic?: boolean })._optimistic && (report.code ?? '') === code,
      ),
    [reportsQuery.data, code],
  );

  const isPrevDisabled = create.isPending || (selectedMonth === 0 && selectedYear === MIN_YEAR);
  const isNextDisabled = create.isPending || (selectedMonth === 11 && selectedYear === MAX_YEAR);

  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleClose = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
    setSubmitError(undefined);
    onClose();
  };

  const handleSubmit = () => {
    setSubmitError(undefined);

    if (codeExists) {
      setSubmitError('Такой период уже существует');
      return;
    }

    create.mutate(
      {
        name,
        code,
        periodStart,
        periodEnd,
      },
      {
        onSuccess: handleClose,
        onError: (error: Error) => setSubmitError(getErrorMessage(error)),
      },
    );
  };

  return (
    <VModal
      visible={visible}
      title="Новый период"
      className={styles.dialog}
      onClose={handleClose}
      error={submitError}
      footer={
        <>
          <VButton variant="secondary" onClick={handleClose}>
            Отмена
          </VButton>
          <VButton onClick={handleSubmit} isLoading={create.isPending} isDisabled={codeExists}>
            Сохранить
          </VButton>
        </>
      }
    >
      <div className={modalStyles.content}>
        <div className={styles.preview} aria-live="polite">
          <strong>{name}</strong>
          <span>
            {formatDisplay(periodStart)} — {formatDisplay(periodEnd)}
          </span>
        </div>
        <div className={styles.periodSelector}>
          <VIconButton
            ariaLabel="Предыдущий месяц"
            onClick={goToPrevMonth}
            isDisabled={isPrevDisabled}
            color="var(--md-sys-color-on-surface)"
          >
            <ChevronLeftIcon size={20} color="currentColor" />
          </VIconButton>
          <div className={styles.selectsRow}>
            <div className={styles.selectGrow}>
              <VSelect
                label="Месяц"
                options={MONTH_OPTIONS}
                value={String(selectedMonth)}
                disabled={create.isPending}
                required
                onChange={(value) => setSelectedMonth(Number(value))}
              />
            </div>
            <div className={styles.selectFixed}>
              <VSelect
                label="Год"
                options={YEAR_OPTIONS}
                value={String(selectedYear)}
                disabled={create.isPending}
                required
                onChange={(value) => setSelectedYear(Number(value))}
              />
            </div>
          </div>
          <VIconButton
            ariaLabel="Следующий месяц"
            onClick={goToNextMonth}
            isDisabled={isNextDisabled}
            color="var(--md-sys-color-on-surface)"
          >
            <ChevronRightIcon size={20} color="currentColor" />
          </VIconButton>
        </div>

        {codeExists && !create.isPending && (
          <VBanner type="error" visible message="Такой период уже существует" />
        )}
      </div>
    </VModal>
  );
};
