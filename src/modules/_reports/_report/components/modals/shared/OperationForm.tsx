import layout from '../../../../reports.module.css';
import { useRef, useState } from 'react';
import { useAuth } from '@/shared/api/authProvider';
import { ApiError } from '@/shared/api/http';
import { useAccounts } from '@/shared/api/hooks/useAccounts';
import type { ApiOperationType, Operation, Report } from '@/shared/api/types/domain';
import { useCreateOperation } from '../../../api/useCreateOperation';
import { useUpdateOperation } from '../../../api/useUpdateOperation';
import { useRemoveOperation } from '../../../api/useRemoveOperation';
import { VButton } from '@/shared/ui/VButton';
import { VDatePicker } from '@/shared/ui/VDatePicker';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VModal } from '@/shared/ui/VModal';
import { VSelect } from '@/shared/ui/VSelect';
import { VTextInput } from '@/shared/ui/VTextInput';
import { TrashIcon } from '@/shared/icons';
import { capitalizeFirst, formatDisplay, getErrorMessage, toISODate } from '@/shared/utils';
import modalStyles from '@/shared/styles/modal.module.css';
import { CategorySelect } from './CategorySelect';
import { AmountAdjuster } from './AmountAdjuster';
import { getAmountError } from './amountValidation';

const isCurrentType = (value: string): value is ApiOperationType =>
  value === 'income' || value === 'expense' || value === 'transfer';

const closedMessage =
  'Операцию закрытого счёта нельзя изменить или удалить. Сначала откройте счёт.';

// Дефолт даты: сегодня, если попадает в период отчёта; иначе ближайшая граница —
// первый день периода (период ещё не начался) или последний день (период уже прошёл).
// Сравнение строк корректно, т.к. даты в формате ISO YYYY-MM-DD.
const getDefaultOperationDate = (periodStart: string, periodEnd: string): string => {
  const today = toISODate(new Date());
  if (today < periodStart) {
    return periodStart;
  }
  if (today > periodEnd) {
    return periodEnd;
  }
  return today;
};

interface OperationFormProps {
  initialType?: ApiOperationType;
  operation?: Operation;
  report: Report;
  onClose: () => void;
}

export const OperationForm = ({
  initialType = 'expense',
  operation,
  report,
  onClose,
}: OperationFormProps) => {
  const { user } = useAuth();
  const accountsQuery = useAccounts(user?.id ?? '');
  const createOperation = useCreateOperation(report.id);
  const updateOperation = useUpdateOperation(report.id);
  const removeOperation = useRemoveOperation(report.id);
  
  
  const type: ApiOperationType =
    operation && isCurrentType(operation.type) ? operation.type : initialType;
  const [amount, setAmount] = useState(operation ? String(operation.amount) : '');
  const [description, setDescription] = useState(operation?.description ?? '');
  const [date, setDate] = useState(
    () => operation?.date ?? getDefaultOperationDate(report.period_start, report.period_end),
  );
  const [categoryId, setCategoryId] = useState(operation?.category_id ?? '');
  
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>(
    operation ? (operation.account_id ?? '') : undefined,
  );
  const [selectedFrom, setSelectedFrom] = useState<string | undefined>(
    operation ? (operation.from_account_id ?? '') : undefined,
  );
  const [toAccountId, setToAccountId] = useState(operation?.to_account_id ?? '');
  const [amountError, setAmountError] = useState<string>();
  const [dateError, setDateError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [serverLocked, setServerLocked] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const submitting = useRef(false);

  const accounts = accountsQuery.data ?? [];
  const openAccounts = accounts.filter((account) => !account.is_closed);
  const primaryId = openAccounts.find((account) => account.is_primary)?.id ?? '';
  const accountId = selectedAccount ?? primaryId;
  const fromAccountId = selectedFrom ?? primaryId;
  const originalIds = operation
    ? [operation.account_id, operation.from_account_id, operation.to_account_id].filter(
        (id): id is string => Boolean(id),
      )
    : [];
  const isClosed =
    serverLocked ||
    accounts.some((account) => originalIds.includes(account.id) && account.is_closed);
  const unsupported = Boolean(operation && !isCurrentType(operation.type));
  const isPending =
    isPreparing ||
    createOperation.isPending ||
    updateOperation.isPending ||
    removeOperation.isPending;
  const fieldsDisabled = isPending || isClosed || unsupported;
  const accountStatusError = accountsQuery.isPending
    ? 'Загрузка счетов…'
    : accountsQuery.isError
      ? `Не удалось загрузить счета: ${getErrorMessage(accountsQuery.error)}`
      : undefined;
  const accountError =
    !accountStatusError && !isClosed
      ? openAccounts.length === 0
        ? 'Без открытого счёта добавить операцию нельзя. Откройте счёт в профиле.'
        : type === 'transfer' && openAccounts.length < 2
          ? 'Для перевода нужны два разных открытых счёта.'
          : undefined
      : undefined;
  const blockedMessage = isClosed
    ? closedMessage
    : unsupported
      ? 'Этот тип операции больше не поддерживается.'
      : undefined;
  const canSave = !fieldsDisabled && !accountStatusError && !accountError;
  const canDelete = Boolean(operation) && !fieldsDisabled && !accountStatusError;

  const handleClose = () => {
    if (!submitting.current && !isPending) onClose();
  };

  const handleError = async (error: unknown, deleting = false) => {
    setSubmitError(getErrorMessage(error));
    if (error instanceof ApiError && error.code === 'ACCOUNT_CLOSED') {
      
      if (deleting) setServerLocked(true);
      const refreshed = await accountsQuery.refetch();
      if (operation && !deleting) {
        const originalsKnownOpen =
          !refreshed.isError &&
          originalIds.length > 0 &&
          originalIds.every((id) =>
            refreshed.data?.some((account) => account.id === id && !account.is_closed),
          );
        setServerLocked(!originalsKnownOpen);
      }
    }
  };

  const handleSubmit = async () => {
    if (!canSave || submitting.current) return;
    setSubmitError(undefined);
    const error = getAmountError(amount);
    setAmountError(error);
    if (error) return;
    if (!date) {
      setDateError('Выберите дату операции.');
      return;
    }
    setDateError(undefined);
    const isOpen = (id: string) => openAccounts.some((account) => account.id === id);
    if (type === 'transfer') {
      if (!isOpen(fromAccountId) || !isOpen(toAccountId)) {
        setSubmitError('Выберите открытые счета списания и зачисления.');
        return;
      }
      if (fromAccountId === toAccountId) {
        setSubmitError('Счета перевода должны различаться.');
        return;
      }
    } else if (!isOpen(accountId)) {
      setSubmitError('Выберите открытый счёт операции.');
      return;
    }
    submitting.current = true;
    setIsPreparing(true);
    try {
      if (date < report.period_start || date > report.period_end) {
        throw new Error(
          `Дата должна быть в пределах периода (${formatDisplay(report.period_start)} — ${formatDisplay(report.period_end)})`,
        );
      }
      const common = {
        amount: Number(amount),
        description: description || null,
        date,
      };
      const input =
        type === 'transfer'
          ? { ...common, type, from_account_id: fromAccountId, to_account_id: toAccountId }
          : {
              ...common,
              type,
              account_id: accountId,
              categoryId: categoryId || null,
            };
      if (operation) {
        await updateOperation.mutateAsync({
          id: operation.id,
          input,
        });
      } else {
        await createOperation.mutateAsync(input);
      }
      onClose();
    } catch (error) {
      await handleError(error);
    } finally {
      submitting.current = false;
      setIsPreparing(false);
    }
  };

  const handleDelete = async () => {
    if (!operation || !canDelete || submitting.current) return;
    submitting.current = true;
    setIsPreparing(true);
    setSubmitError(undefined);
    try {
      await removeOperation.mutateAsync(operation.id);
      onClose();
    } catch (error) {
      await handleError(error, true);
    } finally {
      submitting.current = false;
      setIsPreparing(false);
    }
  };

  const accountOptions = openAccounts.map((account) => ({
    value: account.id,
    label: account.name,
  }));

  return (
    <VModal
      className={layout.dialog}
      visible
      title={operation ? 'Изменить операцию' : 'Новая операция'}
      onClose={handleClose}
      error={blockedMessage ?? submitError ?? accountStatusError ?? accountError}
      footer={
        <div className={modalStyles.footerSplit}>
          {operation && (
            <VIconButton
              ariaLabel="Удалить операцию"
              onClick={handleDelete}
              isDisabled={!canDelete}
              isLoading={removeOperation.isPending}
              color="var(--md-sys-color-error)"
            >
              <TrashIcon size={24} color="currentColor" />
            </VIconButton>
          )}
          <div className={modalStyles.footerRight}>
            <VButton variant="secondary" onClick={handleClose} isDisabled={isPending}>
              Отмена
            </VButton>
            <VButton
              onClick={handleSubmit}
              isDisabled={!canSave}
              isLoading={isPending && !removeOperation.isPending}
            >
              Сохранить
            </VButton>
          </div>
        </div>
      }
    >
      <div className={modalStyles.content}>
        {accountsQuery.isError && (
          <VButton
            variant="secondary"
            onClick={() => void accountsQuery.refetch()}
            isDisabled={isPending}
          >
            Повторить загрузку счетов
          </VButton>
        )}
        {type === 'transfer' ? (
          <>
            <VSelect
              label="Со счёта"
              options={accountOptions.filter((option) => option.value !== toAccountId)}
              value={fromAccountId}
              emptyText="Выберите счёт списания"
              disabled={fieldsDisabled || Boolean(accountStatusError)}
              required
              onChange={setSelectedFrom}
            />
            <VSelect
              label="На счёт"
              options={accountOptions.filter((option) => option.value !== fromAccountId)}
              value={toAccountId}
              emptyText="Выберите счёт зачисления"
              disabled={fieldsDisabled || Boolean(accountStatusError)}
              required
              onChange={setToAccountId}
            />
          </>
        ) : (
          <VSelect
            label="Счёт"
            options={accountOptions}
            value={accountId}
            emptyText="Выберите счёт"
            disabled={fieldsDisabled || Boolean(accountStatusError)}
            required
            onChange={setSelectedAccount}
          />
        )}
        <VTextInput
          label="Сумма"
          numeric
          placeholder="0.00"
          value={amount}
          error={amountError}
          disabled={fieldsDisabled}
          onChange={(value) => {
            setAmount(value);
            setAmountError(undefined);
          }}
        />
        {operation && (
          <AmountAdjuster
            amount={amount}
            onAmountChange={(next, error) => {
              setAmount(next);
              setAmountError(error);
            }}
            controlsDisabled={!canSave}
          />
        )}
        <VTextInput
          label="Описание"
          placeholder="Описание операции"
          value={description}
          disabled={fieldsDisabled}
          onChange={(value) => setDescription(capitalizeFirst(value))}
        />
        {(type === 'income' || type === 'expense') && (
          <CategorySelect
            userId={user?.id ?? ''}
            categoryType={type}
            value={categoryId}
            disabled={fieldsDisabled}
            onChange={setCategoryId}
          />
        )}
        <VDatePicker
          label="Дата"
          value={date}
          error={dateError}
          disabled={fieldsDisabled}
          onChange={(next) => {
            setDate(next);
            setDateError(undefined);
          }}
          minDate={report.period_start}
          maxDate={report.period_end}
          showStepButtons
          allowClear={false}
        />
      </div>
    </VModal>
  );
};
