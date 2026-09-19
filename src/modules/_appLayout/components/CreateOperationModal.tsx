import { useRef, useState } from 'react';
import { useAuth } from '@/shared/api/authProvider';
import { useAccounts } from '@/shared/api/hooks/useAccounts';
import type { ApiOperationType } from '@/shared/api/types/domain';
import { VButton } from '@/shared/ui/VButton';
import { VButtonGroup } from '@/shared/ui/VButtonGroup';
import { VDatePicker } from '@/shared/ui/VDatePicker';
import { VModal } from '@/shared/ui/VModal';
import { VSelect } from '@/shared/ui/VSelect';
import { VTextInput } from '@/shared/ui/VTextInput';
import { capitalizeFirst, getErrorMessage, toISODate } from '@/shared/utils';
import modalStyles from '@/shared/styles/modal.module.css';
import { useCreateOperation } from '../api/useCreateOperation';
import { useCategoriesByType } from '../api/useCategories';
import { VCategoryDot } from '@/shared/ui/VCategoryDot';
import { useMemo } from 'react';

const TYPE_OPTIONS = [
  { value: 'expense', label: 'Расход' },
  { value: 'income', label: 'Доход' },
  { value: 'transfer', label: 'Перевод' },
];

const getAmountError = (amount: string): string | undefined => {
  const trimmed = amount.trim();
  const value = Number(trimmed);
  if (trimmed === '' || !Number.isFinite(value) || value < 0) {
    return 'Укажите неотрицательную сумму';
  }
  return undefined;
};

interface CreateOperationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreateOperationModal = ({ visible, onClose }: CreateOperationModalProps) => {
  const { user } = useAuth();
  const accountsQuery = useAccounts(user?.id ?? '');
  const createOperation = useCreateOperation();

  const [type, setType] = useState<ApiOperationType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => toISODate(new Date()));
  const [categoryId, setCategoryId] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>(undefined);
  const [selectedFrom, setSelectedFrom] = useState<string | undefined>(undefined);
  const [toAccountId, setToAccountId] = useState('');
  const [amountError, setAmountError] = useState<string>();
  const [dateError, setDateError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const submitting = useRef(false);

  const categoriesQuery = useCategoriesByType(
    user?.id ?? '',
    type === 'transfer' ? 'expense' : type,
  );
  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'Без категории' },
      ...(categoriesQuery.data ?? []).map((category) => ({
        value: category.id,
        label: category.name,
        ...(category.color ? { prefix: <VCategoryDot color={category.color} /> } : {}),
      })),
    ],
    [categoriesQuery.data],
  );

  if (!visible) return null;

  const accounts = accountsQuery.data ?? [];
  const openAccounts = accounts.filter((account) => !account.is_closed);
  const primaryId = openAccounts.find((account) => account.is_primary)?.id ?? '';
  const accountId = selectedAccount ?? primaryId;
  const fromAccountId = selectedFrom ?? primaryId;
  const isPending = createOperation.isPending;
  const accountStatusError = accountsQuery.isPending
    ? 'Загрузка счетов…'
    : accountsQuery.isError
      ? `Не удалось загрузить счета: ${getErrorMessage(accountsQuery.error)}`
      : undefined;
  const accountError =
    !accountStatusError && openAccounts.length === 0
      ? 'Без открытого счёта добавить операцию нельзя. Откройте счёт в профиле.'
      : !accountStatusError && type === 'transfer' && openAccounts.length < 2
        ? 'Для перевода нужны два разных открытых счёта.'
        : undefined;
  const canSave = !isPending && !accountStatusError && !accountError;

  const handleClose = () => {
    if (!submitting.current && !isPending) onClose();
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
    try {
      const common = { amount: Number(amount), description: description || null, date };
      if (type === 'transfer') {
        await createOperation.mutateAsync({
          ...common,
          type,
          from_account_id: fromAccountId,
          to_account_id: toAccountId,
        });
      } else {
        await createOperation.mutateAsync({
          ...common,
          type,
          account_id: accountId,
          categoryId: categoryId || null,
        });
      }
      onClose();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      submitting.current = false;
    }
  };

  const accountOptions = openAccounts.map((account) => ({
    value: account.id,
    label: account.name,
  }));

  return (
    <VModal
      visible
      title="Новая операция"
      onClose={handleClose}
      error={submitError ?? accountStatusError ?? accountError}
      footer={
        <div className={modalStyles.footerRight}>
          <VButton variant="secondary" onClick={handleClose} isDisabled={isPending}>
            Отмена
          </VButton>
          <VButton onClick={handleSubmit} isDisabled={!canSave} isLoading={isPending}>
            Сохранить
          </VButton>
        </div>
      }
    >
      <div className={modalStyles.content}>
        <VButtonGroup
          label="Тип операции"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(value: ApiOperationType) => setType(value)}
          fullWidth
        />
        {type === 'transfer' ? (
          <>
            <VSelect
              label="Со счёта"
              options={accountOptions.filter((option) => option.value !== toAccountId)}
              value={fromAccountId}
              emptyText="Выберите счёт списания"
              required
              onChange={setSelectedFrom}
            />
            <VSelect
              label="На счёт"
              options={accountOptions.filter((option) => option.value !== fromAccountId)}
              value={toAccountId}
              emptyText="Выберите счёт зачисления"
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
          onChange={(value) => {
            setAmount(value);
            setAmountError(undefined);
          }}
        />
        <VTextInput
          label="Описание"
          placeholder="Описание операции"
          value={description}
          onChange={(value) => setDescription(capitalizeFirst(value))}
        />
        {(type === 'income' || type === 'expense') && (
          <VSelect
            label="Категория"
            options={categoryOptions}
            value={categoryId}
            onChange={setCategoryId}
          />
        )}
        <VDatePicker
          label="Дата"
          value={date}
          error={dateError}
          onChange={(next) => {
            setDate(next);
            setDateError(undefined);
          }}
          showStepButtons
          allowClear={false}
        />
      </div>
    </VModal>
  );
};
