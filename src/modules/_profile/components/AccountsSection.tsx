import { useAtom, useSetAtom } from 'jotai';
import { accountEditorAtom, deletingAccountAtom, accountFormAtom } from '../atoms/profile';
import { useAuth } from '@/shared/api/authProvider';
import { useProfile } from '@/shared/api/hooks';
import type { Account } from '@/shared/api/types/domain';
import { CURRENCIES, QUICK_CURRENCIES } from '@/shared/constants/currencies';
import { VBadge } from '@/shared/ui/VBadge';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VCheckbox } from '@/shared/ui/VCheckbox';
import { VConfirmModal } from '@/shared/ui/VConfirmModal';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VSelect } from '@/shared/ui/VSelect';
import { VSkeletonList } from '@/shared/ui/VSkeleton';
import { formatAmount, getErrorMessage } from '@/shared/utils';
import commonStyles from '@/shared/styles/common.module.css';
import { useAccounts } from '../api/useAccounts';
import { useUpdateAccount } from '../api/useUpdateAccount';
import { useRemoveAccount } from '../api/useRemoveAccount';
import { useUpdateCurrency } from '../api/useUpdateCurrency';
import { AccountFormModal } from './AccountFormModal';
import styles from './AccountsSection.module.css';

const currencyOptions = CURRENCIES.filter((c) =>
  (QUICK_CURRENCIES as readonly string[]).includes(c.code),
).map((c) => ({ value: c.code, label: `${c.name} (${c.symbol})` }));

export const AccountsSection = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const profile = useProfile();
  const accounts = useAccounts(userId);
  const update = useUpdateAccount(userId);
  const remove = useRemoveAccount(userId);
  const currency = useUpdateCurrency();
  const [editor, setEditor] = useAtom(accountEditorAtom);
  const [deleting, setDeleting] = useAtom(deletingAccountAtom);
  const setForm = useSetAtom(accountFormAtom);
  const openEditor = (account: Account | null) => {
    setForm({ name: account?.name ?? '', balance: String(account?.initial_balance ?? 0) });
    setEditor({ account });
  };
  const busy = update.isPending || remove.isPending;
  const currencySymbol = CURRENCIES.find((c) => c.code === profile.data?.currency)?.symbol;

  return (
    <VCard>
      <section className={commonStyles.columnL} aria-label="Счета">
        <div className={styles.header}>
          <h2 className={commonStyles.titleXl}>Счета</h2>
          <VButton onClick={() => openEditor(null)} isDisabled={busy}>
            Создать счёт
          </VButton>
        </div>
        <VSelect
          label="Валюта"
          options={currencyOptions}
          value={profile.data?.currency ?? ''}
          disabled={currency.isPending || !profile.data}
          onChange={(value) => currency.mutate(value || null)}
        />
        {profile.error && (
          <VErrorCard
            title="Не удалось загрузить профиль"
            error={profile.error}
            onRetry={() => void profile.refetch()}
            isRetrying={profile.isFetching}
          />
        )}
        {currency.error && (
          <VBanner type="error" visible message={getErrorMessage(currency.error)} />
        )}
        {update.error && (
          <VBanner
            type="error"
            visible
            message={getErrorMessage(update.error)}
            onClose={() => update.reset()}
          />
        )}
        {accounts.error && (
          <VErrorCard
            title="Не удалось загрузить счета"
            error={accounts.error}
            onRetry={() => void accounts.refetch()}
            isRetrying={accounts.isFetching}
          />
        )}
        {accounts.isLoading && <VSkeletonList count={2} />}
        {accounts.data?.length === 0 && (
          <p className={commonStyles.emptyHint}>
            Счетов пока нет. Создайте счёт, чтобы учитывать деньги на карте или наличные.
          </p>
        )}
        <ul className={styles.list} aria-busy={busy}>
          {accounts.data?.map((account) => (
            <li key={account.id} className={styles.account}>
              <div className={styles.header}>
                <div className={styles.identity}>
                  <h3 className={styles.name}>{account.name}</h3>
                  <div className={styles.badges}>
                    <VBadge>{account.is_closed ? 'Закрыт' : 'Открыт'}</VBadge>
                    {account.is_primary && <VBadge variant="accent">Основной</VBadge>}
                  </div>
                </div>
                <div className={styles.balance}>
                  <span className={commonStyles.infoLabel}>Текущий баланс</span>
                  <span className={styles.amount}>
                    {formatAmount(account.balance, currencySymbol)}
                  </span>
                </div>
              </div>
              <VCheckbox
                checked={account.is_primary}
                disabled={busy || account.is_primary || account.is_closed}
                onChange={(checked) => {
                  if (checked) update.mutate({ id: account.id, is_primary: true });
                }}
              >
                {account.is_primary ? 'Основной счёт' : `Сделать «${account.name}» основным`}
              </VCheckbox>
              {account.is_primary && (
                <p className={styles.hint}>
                  Чтобы удалить или закрыть этот счёт, сначала назначьте другой основным.
                </p>
              )}
              {account.is_closed && (
                <p className={styles.hint}>Чтобы сделать счёт основным, сначала откройте его.</p>
              )}
              {!account.is_closed && !account.is_primary && account.balance !== 0 && (
                <p className={styles.hint}>Закрыть счёт можно только с нулевым балансом.</p>
              )}
              <div className={styles.actions}>
                <VButton variant="secondary" isDisabled={busy} onClick={() => openEditor(account)}>
                  Редактировать
                </VButton>
                <VButton
                  variant="secondary"
                  isDisabled={
                    busy || account.is_primary || (!account.is_closed && account.balance !== 0)
                  }
                  onClick={() => update.mutate({ id: account.id, is_closed: !account.is_closed })}
                >
                  {account.is_closed ? 'Открыть' : 'Закрыть'}
                </VButton>
                <VButton
                  variant="danger"
                  isDisabled={busy || account.is_primary}
                  onClick={() => {
                    remove.reset();
                    setDeleting(account);
                  }}
                >
                  Удалить
                </VButton>
              </div>
            </li>
          ))}
        </ul>
      </section>
      {editor && (
        <AccountFormModal
          key={editor.account?.id ?? 'new'}
          account={editor.account}
          onClose={() => setEditor(null)}
        />
      )}
      <VConfirmModal
        visible={Boolean(deleting)}
        title="Удалить счёт"
        message={`Удалить счёт «${deleting?.name ?? ''}»? Это действие нельзя отменить. Счёт с операциями удалить нельзя.`}
        confirmLabel="Удалить"
        isLoading={remove.isPending}
        error={remove.error ? getErrorMessage(remove.error) : undefined}
        onCancel={() => {
          if (!remove.isPending) {
            setDeleting(null);
            remove.reset();
          }
        }}
        onConfirm={() => {
          if (deleting && !remove.isPending)
            remove.mutate(deleting.id, {
              onSuccess: () => setDeleting(null),
            });
        }}
      />
    </VCard>
  );
};
