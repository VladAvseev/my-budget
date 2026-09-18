import { useState } from 'react';
import type { Account } from '@/shared/api/types/domain';
import { useAuth } from '@/shared/api/authProvider';
import { CheckIcon, TrashIcon } from '@/shared/icons';
import commonStyles from '@/shared/styles/common.module.css';
import modalStyles from '@/shared/styles/modal.module.css';
import { VButton } from '@/shared/ui/VButton';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VModal } from '@/shared/ui/VModal';
import { VTextInput } from '@/shared/ui/VTextInput';
import { VToggle } from '@/shared/ui/VToggle';
import { getErrorMessage } from '@/shared/utils';
import { useCreateAccount } from '../api/useCreateAccount';
import { useUpdateAccount } from '../api/useUpdateAccount';
import styles from './AccountFormModal.module.css';

interface AccountFormModalProps {
  account: Account | null;
  onClose: () => void;
  onRequestDelete?: (account: Account) => void;
}

export const AccountFormModal = ({ account, onClose, onRequestDelete }: AccountFormModalProps) => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const create = useCreateAccount(userId);
  const update = useUpdateAccount(userId);

  const [name, setName] = useState(account?.name ?? '');
  const [balance, setBalance] = useState(String(account?.initial_balance ?? 0));
  const [isPrimary, setIsPrimary] = useState(Boolean(account?.is_primary));
  const [isClosed, setIsClosed] = useState(Boolean(account?.is_closed));
  const [nameError, setNameError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const pending = create.isPending || update.isPending;

  const close = () => {
    if (!pending) onClose();
  };

  const cannotClose =
    Boolean(account?.is_primary) || (!isClosed && (account?.balance ?? 0) !== 0);

  const getCloseHint = () => {
    if (account?.is_primary) {
      return 'Основной счёт нельзя закрыть. Сначала назначьте другой счёт основным.';
    }
    if (!isClosed && (account?.balance ?? 0) !== 0) {
      return 'Закрыть счёт можно только с нулевым балансом.';
    }
    if (isClosed) {
      return 'Счёт закрыт и скрыт из списков добавления операций.';
    }
    return 'Закрытые счета скрываются из списков операций.';
  };

  const save = () => {
    if (pending) return;
    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError('Укажите название счёта');
      return;
    }

    setNameError(undefined);
    setSubmitError(undefined);

    const formattedBalance = balance.trim().replace(/,/g, '.');

    if (account) {
      const fields: {
        name: string;
        initial_balance: string;
        is_closed?: boolean;
        is_primary?: true;
      } = {
        name: trimmedName,
        initial_balance: formattedBalance,
      };

      if (isClosed !== account.is_closed) {
        fields.is_closed = isClosed;
      }
      if (isPrimary && !account.is_primary) {
        fields.is_primary = true;
      }

      update.mutate(
        { id: account.id, ...fields },
        {
          onSuccess: onClose,
          onError: (error: Error) => setSubmitError(getErrorMessage(error)),
        },
      );
    } else {
      create.mutate(
        { name: trimmedName, initial_balance: formattedBalance },
        {
          onSuccess: onClose,
          onError: (error: Error) => setSubmitError(getErrorMessage(error)),
        },
      );
    }
  };

  return (
    <VModal
      visible
      title={account ? 'Редактировать счёт' : 'Новый счёт'}
      onClose={close}
      error={submitError}
      footer={
        account ? (
          <div className={modalStyles.footerSplit}>
            <VIconButton
              ariaLabel="Удалить счёт"
              title={account.is_primary ? 'Основной счёт нельзя удалить' : 'Удалить счёт'}
              isDisabled={pending || account.is_primary}
              onClick={() => onRequestDelete?.(account)}
              color="var(--md-sys-color-error)"
            >
              <TrashIcon size={24} color="currentColor" />
            </VIconButton>
            <div className={modalStyles.footerRight}>
              <VButton variant="secondary" onClick={close} isDisabled={pending}>
                Отмена
              </VButton>
              <VButton onClick={save} isLoading={pending}>
                Сохранить
              </VButton>
            </div>
          </div>
        ) : (
          <>
            <VButton variant="secondary" onClick={close} isDisabled={pending}>
              Отмена
            </VButton>
            <VButton onClick={save} isLoading={pending}>
              Создать
            </VButton>
          </>
        )
      }
    >
      <form
        className={commonStyles.columnL}
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <VTextInput
          label="Название счёта"
          aria-label="Название счёта"
          value={name}
          error={nameError}
          disabled={pending}
          placeholder="Например, Карта или Наличные"
          onChange={(val) => {
            setName(val);
            setNameError(undefined);
          }}
        />

        <VTextInput
          label="Начальная сумма"
          aria-label="Начальная сумма"
          value={balance}
          disabled={pending}
          inputMode="decimal"
          placeholder="0"
          onChange={setBalance}
        />

        <p className={commonStyles.emptyHint}>
          Сумма на счёте до начала учёта операций. Может быть отрицательной.
        </p>

        {account && (
          <section aria-label="Статус счёта" className={styles.statusSection}>
            {account.is_primary ? (
              <div className={styles.primaryNotice}>
                <CheckIcon size={18} color="currentColor" />
                <span>Это основной счёт (выбирается по умолчанию для новых операций)</span>
              </div>
            ) : (
              <VToggle
                label={
                  <span className={styles.toggleText}>
                    <span className={styles.toggleLabel}>Сделать основным</span>
                    <span className={styles.toggleHint}>
                      {isClosed
                        ? 'Чтобы сделать счёт основным, сначала откройте его'
                        : 'Назначить счётом по умолчанию для новых операций'}
                    </span>
                  </span>
                }
                checked={isPrimary}
                disabled={isClosed || pending}
                onChange={setIsPrimary}
              />
            )}

            <VToggle
              label={
                <span className={styles.toggleText}>
                  <span className={styles.toggleLabel}>
                    {isClosed ? 'Счёт закрыт' : 'Закрыть счёт'}
                  </span>
                  <span className={styles.toggleHint}>{getCloseHint()}</span>
                </span>
              }
              checked={isClosed}
              disabled={cannotClose || pending}
              onChange={(nextChecked) => {
                setIsClosed(nextChecked);
                if (nextChecked) {
                  setIsPrimary(false);
                }
              }}
            />
          </section>
        )}
      </form>
    </VModal>
  );
};
