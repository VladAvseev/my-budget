import type { Account } from '@/shared/api/types/domain';
import { BanknotesIcon, ChevronRightIcon, WalletFilledIcon } from '@/shared/icons';
import { Amount } from '@/shared/ui/Amount';
import { VBadge } from '@/shared/ui/VBadge';
import { VCard } from '@/shared/ui/VCard';
import { VCategoryDot } from '@/shared/ui/VCategoryDot';
import styles from './AccountItemCard.module.css';

interface AccountItemCardProps {
  account: Account;
  currencySymbol?: string;
  onClick: (account: Account) => void;
}

export const AccountItemCard = ({ account, currencySymbol, onClick }: AccountItemCardProps) => {
  const handleClick = () => {
    onClick(account);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(account);
    }
  };

  return (
    <VCard
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`${styles.card}${account.is_closed ? ` ${styles.closed}` : ''}`}
      aria-label={`Счёт ${account.name}, баланс ${account.balance}`}
    >
      <div className={styles.left}>
        <div
          className={`${styles.iconWrap}${account.is_primary ? ` ${styles.primaryIcon}` : ''}`}
          aria-hidden="true"
        >
          {account.is_primary ? (
            <WalletFilledIcon size={22} color="currentColor" />
          ) : (
            <BanknotesIcon size={22} color="currentColor" />
          )}
        </div>

        <div className={styles.identity}>
          <div className={styles.nameGroup}>
            <VCategoryDot color={account.color ?? 'var(--md-sys-color-outline-variant)'} />
            <span className={styles.name}>{account.name}</span>
            <div className={styles.badges}>
              {account.is_primary && <VBadge variant="accent">Основной</VBadge>}
              {account.is_closed && <VBadge>Закрыт</VBadge>}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <span className={styles.amount}>
          <Amount value={account.balance} currencySymbol={currencySymbol} />
        </span>
        <span className={styles.chevron} aria-hidden="true">
          <ChevronRightIcon size={20} color="currentColor" />
        </span>
      </div>
    </VCard>
  );
};
