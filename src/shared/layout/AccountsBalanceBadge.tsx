import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useAuth } from '@/shared/api/authProvider';
import { useCapital, useCurrency } from '@/shared/api/hooks';
import { useBreakpoint } from '@/shared/hooks';
import { ChevronDownIcon } from '@/shared/icons';
import { VBadge } from '@/shared/ui/VBadge';
import { formatAmount } from '@/shared/utils';
import styles from './AccountsBalanceBadge.module.css';

export const AccountsBalanceBadge = () => {
  const { user } = useAuth();
  const accountsQuery = useCapital(user?.id ?? '');
  const currency = useCurrency();
  const { isDesktop } = useBreakpoint();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const { accounts, capital } = accountsQuery;
  const expandable = accounts.length > 1;
  const expanded = expandable && isOpen;
  const amount = accountsQuery.data
    ? formatAmount(capital ?? 0, currency?.symbol)
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
      {`Капитал ${amount}`}
      {expandable && (
        <span aria-hidden="true" className={styles.arrow}>
          <ChevronDownIcon
            size={16}
            color="currentColor"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s ease',
            }}
          />
        </span>
      )}
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
