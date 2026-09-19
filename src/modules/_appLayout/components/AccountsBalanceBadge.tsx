import { useEffect, useId, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useAuth } from '@/shared/api/authProvider';
import { useCapital, useCurrency } from '@/shared/api/hooks';
import { useBreakpoint } from '@/shared/hooks';
import {
  BanknotesIcon,
  ChevronDownIcon,
  ClearIcon,
  EyeIcon,
  EyeOffIcon,
  WalletFilledIcon,
} from '@/shared/icons';
import { Amount, CurrencyText } from '@/shared/ui/Amount';
import { VButton } from '@/shared/ui/VButton';
import { formatAmount } from '@/shared/utils';
import { hideBalanceAtom } from '../atoms/privacy';
import styles from './AccountsBalanceBadge.module.css';

export const AccountsBalanceBadge = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const accountsQuery = useCapital(user?.id ?? '');
  const currency = useCurrency();
  const { isMobile } = useBreakpoint();
  const [isOpen, setIsOpen] = useState(false);
  const [hideBalance, setHideBalance] = useAtom(hideBalanceAtom);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const { accounts, capital } = accountsQuery;
  const accountsCount = accounts.length;

  const formattedCapital = accountsQuery.data
    ? hideBalance
      ? '••••••'
      : formatAmount(capital ?? 0, currency?.symbol)
    : accountsQuery.isError
      ? 'Недоступен'
      : 'Загрузка…';

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleOutsideClick = (event: PointerEvent) => {
      if (isMobile) return;
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handleOutsideClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (!isOpen || !isMobile) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, isMobile]);

  useLayoutEffect(() => {
    if (!isOpen || isMobile) return;
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
  }, [isOpen, isMobile]);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const togglePrivacy = (e: MouseEvent) => {
    e.stopPropagation();
    setHideBalance((prev) => !prev);
  };

  const panelContent = (
    <>
      <div className={styles.panelHeader}>
        <div className={styles.headerTitleGroup}>
          <span className={styles.panelTitle}>Счета и балансы</span>
          {accountsCount > 0 && (
            <span
              className={styles.countBadge}
              aria-label={`Открытых счетов: ${accountsCount}`}
            >
              {accountsCount}
            </span>
          )}
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.privacyButton}
            onClick={togglePrivacy}
            aria-label={hideBalance ? 'Показать суммы' : 'Скрыть суммы'}
            title={hideBalance ? 'Показать суммы' : 'Скрыть суммы'}
          >
            {hideBalance ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
          {isMobile && (
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Закрыть"
            >
              <ClearIcon size={18} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.listContainer}>
        {accountsQuery.isLoading && (
          <div className={styles.statusState}>Загрузка счетов…</div>
        )}

        {accountsQuery.isError && (
          <div className={styles.statusState}>Не удалось загрузить счета</div>
        )}

        {!accountsQuery.isLoading && accountsCount === 0 && (
          <div className={styles.emptyState}>
            <span>У вас пока нет открытых счетов</span>
            <Link
              to="/profile"
              className={styles.addAccountLink}
              onClick={() => setIsOpen(false)}
            >
              Создать счёт в профиле
            </Link>
          </div>
        )}

        {accountsCount > 0 && (
          <ul className={styles.list}>
            {accounts.map((account) => (
              <li key={account.id} className={styles.row}>
                <span className={styles.accountIcon} aria-hidden="true">
                  <BanknotesIcon size={18} />
                </span>
                <div className={styles.accountInfo}>
                  <span className={styles.accountName}>{account.name}</span>
                  {account.is_primary && (
                    <span className={styles.primaryBadge}>Основной</span>
                  )}
                </div>
                <span className={styles.accountAmount}>
                  {hideBalance ? (
                    <span className={styles.maskedAmount}>••••••</span>
                  ) : (
                    <Amount value={account.cents / 100} currencySymbol={currency?.symbol} />
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.panelFooter}>
        <VButton
          variant="secondary"
          className={styles.footerButton}
          onClick={() => {
            setIsOpen(false);
            navigate('/profile');
          }}
        >
          Счета
        </VButton>
        <VButton
          variant="primary"
          className={styles.footerButton}
          onClick={() => {
            setIsOpen(false);
            navigate('/capital');
          }}
        >
          Капитал
        </VButton>
      </div>
    </>
  );

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerActive : ''}`}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="dialog"
        aria-label={`Все счета: ${hideBalance ? 'скрыт' : formattedCapital}. Нажмите для просмотра счетов`}
        onClick={toggleOpen}
      >
        <span className={styles.pillIcon} aria-hidden="true">
          <WalletFilledIcon size={18} />
        </span>
        <span className={styles.pillContent}>
          <span className={styles.pillLabel}>Все счета</span>
          <span className={styles.pillValue}>
            <CurrencyText>{formattedCapital}</CurrencyText>
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}
        >
          <ChevronDownIcon size={16} />
        </span>
      </button>

      {isOpen && !isMobile && (
        <div className={styles.popover}>
          <section
            id={panelId}
            role="region"
            aria-label="Счета и балансы"
            className={styles.panel}
            tabIndex={0}
          >
            {panelContent}
          </section>
        </div>
      )}

      {isOpen && isMobile &&
        createPortal(
          <div
            className={styles.backdrop}
            onClick={() => setIsOpen(false)}
            role="presentation"
          >
            <div
              ref={sheetRef}
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Счета и балансы"
              className={styles.sheet}
              onClick={(e) => e.stopPropagation()}
            >
              {panelContent}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
