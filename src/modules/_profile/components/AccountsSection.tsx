import { useAtom } from 'jotai';
import { useAuth } from '@/shared/api/authProvider';
import { useAccounts, useProfile } from '@/shared/api/hooks';
import type { Account } from '@/shared/api/types/domain';
import { CURRENCIES } from '@/shared/constants/currencies';
import commonStyles from '@/shared/styles/common.module.css';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VConfirmModal } from '@/shared/ui/VConfirmModal';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VSkeletonList } from '@/shared/ui/VSkeleton';
import { getErrorMessage } from '@/shared/utils';
import { useRemoveAccount } from '../api/useRemoveAccount';
import { accountEditorAtom, deletingAccountAtom } from '../atoms/profile';
import { AccountFormModal } from './AccountFormModal';
import { AccountItemCard } from './AccountItemCard';
import styles from './AccountsSection.module.css';

export const AccountsSection = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const profile = useProfile();
  const accounts = useAccounts(userId);
  const remove = useRemoveAccount(userId);

  const [editor, setEditor] = useAtom(accountEditorAtom);
  const [deleting, setDeleting] = useAtom(deletingAccountAtom);

  const currencySymbol = CURRENCIES.find((c) => c.code === profile.data?.currency)?.symbol;

  const handleRequestDelete = (account: Account) => {
    setEditor(null);
    setDeleting(account);
  };

  const handleConfirmDelete = () => {
    if (!deleting || remove.isPending) return;
    remove.mutate(deleting.id, {
      onSuccess: () => {
        setDeleting(null);
        remove.reset();
      },
    });
  };

  return (
    <div className={styles.root}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>Счета</h2>
          {accounts.data != null && (
            <span className={styles.count} aria-label={`Всего счетов: ${accounts.data.length}`}>
              {accounts.data.length}
            </span>
          )}
        </div>
        <VButton onClick={() => setEditor({ account: null })}>
          Создать счёт
        </VButton>
      </div>

      {accounts.error && (
        <VErrorCard
          title="Не удалось загрузить счета"
          error={accounts.error}
          onRetry={() => void accounts.refetch()}
          isRetrying={accounts.isFetching}
        />
      )}

      {remove.error && (
        <VBanner
          type="error"
          visible
          message={getErrorMessage(remove.error)}
          onClose={() => remove.reset()}
        />
      )}

      {accounts.isLoading && (
        <VSkeletonList count={2} cardProps={{ compact: true, title: false, lines: 1 }} />
      )}

      {!accounts.isLoading && accounts.data?.length === 0 && (
        <VCard className={styles.emptyCard}>
          <div className={styles.emptyState}>
            <div className={commonStyles.emptyTitle}>
              Счетов пока нет.
            </div>
            <div className={commonStyles.emptyHint}>
              Создайте счёт, чтобы учитывать деньги на карте или наличные.
            </div>
          </div>
        </VCard>
      )}

      {!accounts.isLoading && accounts.data && accounts.data.length > 0 && (
        <ul className={styles.list}>
          {accounts.data.map((account) => (
            <li key={account.id} className={styles.item}>
              <AccountItemCard
                account={account}
                currencySymbol={currencySymbol}
                onClick={(acc) => setEditor({ account: acc })}
              />
            </li>
          ))}
        </ul>
      )}

      {editor && (
        <AccountFormModal
          key={editor.account?.id ?? 'new'}
          account={editor.account}
          onClose={() => setEditor(null)}
          onRequestDelete={handleRequestDelete}
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
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
