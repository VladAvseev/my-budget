import { useAtom } from 'jotai';
import { accountFormAtom } from '../atoms/profile';
import type { Account } from '@/shared/api/types/domain';
import { useAuth } from '@/shared/api/authProvider';
import { VButton } from '@/shared/ui/VButton';
import { VModal } from '@/shared/ui/VModal';
import { VTextInput } from '@/shared/ui/VTextInput';
import { getErrorMessage } from '@/shared/utils';
import commonStyles from '@/shared/styles/common.module.css';
import { useCreateAccount } from '../api/useCreateAccount';
import { useUpdateAccount } from '../api/useUpdateAccount';

interface AccountFormModalProps {
  account: Account | null;
  onClose: () => void;
}

export const AccountFormModal = ({ account, onClose }: AccountFormModalProps) => {
  const { user } = useAuth();
  const create = useCreateAccount(user?.id ?? '');
  const update = useUpdateAccount(user?.id ?? '');
  const [{ name, balance }, setForm] = useAtom(accountFormAtom);
  const pending = create.isPending || update.isPending;
  const error = create.error ?? update.error;
  const close = () => {
    if (!pending) onClose();
  };
  const save = () => {
    if (pending) return;
    const fields = { name: name.trim(), initial_balance: balance.trim().replace(/,/g, '.') };
    if (account) update.mutate({ id: account.id, ...fields }, { onSuccess: onClose });
    else create.mutate(fields, { onSuccess: onClose });
  };

  return (
    <VModal
      visible
      title={account ? 'Редактировать счёт' : 'Новый счёт'}
      onClose={close}
      error={error ? getErrorMessage(error) : undefined}
      footer={
        <>
          <VButton variant="secondary" onClick={close} isDisabled={pending}>
            Отмена
          </VButton>
          <VButton onClick={save} isLoading={pending}>
            Сохранить
          </VButton>
        </>
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
          onChange={(name) => setForm((form) => ({ ...form, name }))}
          disabled={pending}
          placeholder="Например, Карта или Наличные"
        />
        <VTextInput
          label="Начальная сумма"
          aria-label="Начальная сумма"
          value={balance}
          onChange={(balance) => setForm((form) => ({ ...form, balance }))}
          disabled={pending}
          inputMode="decimal"
          placeholder="0"
        />
        <p className={commonStyles.emptyHint}>
          Сумма на счёте до начала учёта операций. Может быть отрицательной. Валюта общая для всех
          счетов и выбирается в профиле.
        </p>
      </form>
    </VModal>
  );
};
