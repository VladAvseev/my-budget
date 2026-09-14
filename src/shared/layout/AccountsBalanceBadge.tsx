import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useAuth } from '@/shared/api/authProvider';
import { useAccounts, useCurrency } from '@/shared/api/hooks';
import { useBreakpoint } from '@/shared/hooks';
import { ChevronDownIcon } from '@/shared/icons';
import { VBadge } from '@/shared/ui/VBadge';
import { formatAmount } from '@/shared/utils';
import styles from './AccountsBalanceBadge.module.css';

export const AccountsBalanceBadge = () => {
  const { user } = useAuth();
  const accountsQuery = useAccounts(user?.id ?? '');
  const currency = useCurrency();
  const { isDesktop } = useBreakpoint();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const accounts = (accountsQuery.data ?? [])
    .filter((account) => !account.is_closed)
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || b.balance - a.balance)
    .map((account) => ({
      ...account,
      // Складываем отображаемые денежные значения: дробные копейки не меняют итог списка.
      cents: Math.round(Number(account.balance.toFixed(2)) * 100),
    }));
  const total = accounts.reduce((sum, account) => sum + account.cents, 0) / 100;
  const expandable = accounts.length > 1;
  const expanded = expandable && isOpen;
  const amount = accountsQuery.data
    ? formatAmount(total, currency?.symbol)
    : accountsQuery.isError
      ? 'Баланс недоступен'
      : 'Загрузка…';

  useEffect(() => {
    if (!expanded) return;
    const handleOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        if (rootRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [expanded]);

  useLayoutEffect(() => {
    if (!expanded) return;
    const measure = () => {
      const root = rootRef.current;
      if (!root) return;
      root.style.setProperty(
        '--available-height',
        `${Math.max(0, window.innerHeight - root.getBoundingClientRect().bottom)}px`,
      );
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [expanded]);

  const badge = (
    <VBadge variant="accent" className={styles.badge}>
      <span className={styles.label}>Капитал</span>
      <span className={styles.amount}>{amount}</span>
      {expandable && <ChevronDownIcon size={14} />}
    </VBadge>
  );

  return (
    <div
      ref={rootRef}
      className={styles.root}
      onMouseEnter={() => {
        if (isDesktop) setIsOpen(true);
      }}
      onMouseLeave={() => {
        if (isDesktop) setIsOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
    >
      {expandable ? (
        <button
          ref={triggerRef}
          type="button"
          className={styles.trigger}
          aria-expanded={expanded}
          aria-controls={expanded ? panelId : undefined}
          aria-label={`Капитал: ${amount}. Балансы по счетам`}
          onClick={() => setIsOpen((open) => !open)}
        >
          {badge}
        </button>
      ) : (
        badge
      )}
      {expanded && (
        <div className={styles.popover}>
          <section
            id={panelId}
            aria-label="Балансы открытых счетов"
            className={styles.panel}
            tabIndex={0}
          >
            <ul className={styles.list}>
              {accounts.map((account) => (
                <li key={account.id} className={styles.row}>
                  <span className={styles.name}>{account.name}</span>
                  <span className={styles.accountAmount}>
                    {formatAmount(account.cents / 100, currency?.symbol)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};
