import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/shared/api/authProvider';
import { ApiError, api } from '@/shared/api/http';
import { useAccounts } from '@/shared/api/hooks/useAccounts';
import type { ApiOperationType, Operation, Report } from '@/shared/api/types/domain';
import { useCreateOperation } from '../../../api/useCreateOperation';
import { useUpdateOperation } from '../../../api/useUpdateOperation';
import { useRemoveOperation } from '../../../api/useRemoveOperation';
import { operationsQueryKey } from '../../../api/keys';
import { VButton } from '@/shared/ui/VButton';
import { VDatePicker } from '@/shared/ui/VDatePicker';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VModal } from '@/shared/ui/VModal';
import { VSelect } from '@/shared/ui/VSelect';
import { VTextInput } from '@/shared/ui/VTextInput';
import { TrashIcon } from '@/shared/icons';
import { capitalizeFirst, formatDisplay, getErrorMessage, getNextFreeDate } from '@/shared/utils';
import modalStyles from '@/shared/styles/modal.module.css';
import { CategorySelect } from './CategorySelect';
import { getAmountError } from './amountValidation';

const isCurrentType = (value: string): value is ApiOperationType =>
  value === 'income' || value === 'expense' || value === 'daily' || value === 'transfer';

const closedMessage =
  'Операцию закрытого счёта нельзя изменить или удалить. Сначала откройте счёт.';

interface OperationFormProps {
  initialType?: ApiOperationType;
  operation?: Operation;
  report: Report;
  onClose: () => void;
  isDeletable?: boolean;
}

export const OperationForm = ({
  initialType = 'expense',
  operation,
  report,
  onClose,
  isDeletable = true,
}: OperationFormProps) => {
  const { user } = useAuth();
  const accountsQuery = useAccounts(user?.id ?? '');
  const createOperation = useCreateOperation(report.id);
  const updateOperation = useUpdateOperation(report.id);
  const removeOperation = useRemoveOperation(report.id);
  // Тип в форме не выбирается: при создании он задан списком (initialType),
  // при редактировании взят из операции и смене не подлежит.
  const type: ApiOperationType =
    operation && isCurrentType(operation.type) ? operation.type : initialType;
  const [amount, setAmount] = useState(operation ? String(operation.amount) : '');
  const [description, setDescription] = useState(operation?.description ?? '');
  const [date, setDate] = useState(operation?.date ?? '');
  const [categoryId, setCategoryId] = useState(operation?.category_id ?? '');
  // undefined означает только ещё не выбранный пользователем дефолт при создании.
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>(
    operation ? (operation.account_id ?? '') : undefined,
  );
  const [selectedFrom, setSelectedFrom] = useState<string | undefined>(
    operation ? (operation.from_account_id ?? '') : undefined,
  );
  const [toAccountId, setToAccountId] = useState(operation?.to_account_id ?? '');
  const [amountError, setAmountError] = useState<string>();
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
  const needsDailyDate = type === 'daily' && operation?.type !== 'daily';
  const dailyQuery = useQuery({
    queryKey: operationsQueryKey(report.id, 'daily'),
    enabled: needsDailyDate && report.has_daily_expenses,
    queryFn: ({ signal }) =>
      api.get<Operation[]>(`/operations?reportId=${report.id}&type=daily`, { signal }),
  });
  const freeDate = getNextFreeDate(
    (dailyQuery.data ?? [])
      .filter((item) => item.id !== operation?.id)
      .map((item) => item.date ?? ''),
    report.period_start,
    report.period_end,
  );
  const displayDate = needsDailyDate ? freeDate : date;
  const accountStatusError = accountsQuery.isPending
    ? 'Загрузка счетов…'
    : accountsQuery.isError
      ? `Не удалось загрузить счета: ${getErrorMessage(accountsQuery.error)}`
      : undefined;
  const dailyError = needsDailyDate
    ? !report.has_daily_expenses
      ? 'Ежедневные расходы не настроены для этого периода.'
      : dailyQuery.isPending
        ? 'Загрузка дат ежедневных расходов…'
        : dailyQuery.isError
          ? `Не удалось загрузить ежедневные расходы: ${getErrorMessage(dailyQuery.error)}`
          : !freeDate
            ? 'Нет свободных дат в периоде.'
            : undefined
    : undefined;
  const accountError =
    !accountStatusError && !isClosed
      ? openAccounts.length === 0
        ? 'Без открытого счёта создать операцию нельзя. Откройте счёт в профиле.'
        : type === 'transfer' && openAccounts.length < 2
          ? 'Для перевода нужны два разных открытых счёта.'
          : undefined
      : undefined;
  const blockedMessage = isClosed
    ? closedMessage
    : unsupported
      ? 'Этот тип операции больше не поддерживается.'
      : undefined;
  const canSave = !fieldsDisabled && !accountStatusError && !accountError && !dailyError;
  const canDelete = Boolean(operation) && isDeletable && !fieldsDisabled && !accountStatusError;

  const handleClose = () => {
    if (!submitting.current && !isPending) onClose();
  };

  const handleError = async (error: unknown, deleting = false) => {
    setSubmitError(getErrorMessage(error));
    if (error instanceof ApiError && error.code === 'ACCOUNT_CLOSED') {
      // При PATCH мог закрыться новый выбор, при DELETE — только исходный счёт.
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
      let requestDate = date || null;
      if (needsDailyDate) {
        const refreshed = await dailyQuery.refetch();
        if (refreshed.isError) throw refreshed.error;
        requestDate = getNextFreeDate(
          (refreshed.data ?? [])
            .filter((item) => item.id !== operation?.id)
            .map((item) => item.date ?? ''),
          report.period_start,
          report.period_end,
        );
        if (!requestDate) throw new Error('Нет свободных дат в периоде');
      }
      if (requestDate && (requestDate < report.period_start || requestDate > report.period_end)) {
        throw new Error(
          `Дата должна быть в пределах периода (${formatDisplay(report.period_start)} — ${formatDisplay(report.period_end)})`,
        );
      }
      const common = {
        amount: Number(amount),
        description: description || null,
        date: requestDate,
      };
      const input =
        type === 'transfer'
          ? { ...common, type, from_account_id: fromAccountId, to_account_id: toAccountId }
          : {
              ...common,
              type,
              account_id: accountId,
              ...(type === 'daily' ? {} : { categoryId: categoryId || null }),
            };
      if (operation) {
        await updateOperation.mutateAsync({
          id: operation.id,
          input: type === 'daily' ? { ...input, categoryId: null } : input,
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
      visible
      title={operation ? 'Изменить операцию' : 'Новая операция'}
      onClose={handleClose}
      error={blockedMessage ?? submitError ?? accountStatusError ?? accountError ?? dailyError}
      footer={
        <div className={modalStyles.footerSplit}>
          {operation && (
            <VIconButton
              ariaLabel="Удалить операцию"
              onClick={handleDelete}
              isDisabled={!canDelete}
              isLoading={removeOperation.isPending}
              color="var(--color-error)"
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
        {needsDailyDate && dailyQuery.isError && (
          <VButton
            variant="secondary"
            onClick={() => void dailyQuery.refetch()}
            isDisabled={isPending}
          >
            Повторить загрузку дат
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
        {type === 'daily' ? (
          <div className={modalStyles.dateLabel}>{displayDate && formatDisplay(displayDate)}</div>
        ) : (
          <VDatePicker
            label="Дата"
            value={date}
            disabled={fieldsDisabled}
            onChange={setDate}
            minDate={report.period_start}
            maxDate={report.period_end}
          />
        )}
        {operation && !isDeletable && (
          <div className={modalStyles.dateLabel}>
            Сначала удалите последний созданный ежедневный расход.
          </div>
        )}
      </div>
    </VModal>
  );
};
