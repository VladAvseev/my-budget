import { useState } from 'react';
import { useAtom } from 'jotai';
import { useAuth } from '@/shared/api/authProvider';
import { useProfile } from '@/shared/api/hooks';
import { CURRENCIES, QUICK_CURRENCIES } from '@/shared/constants/currencies';
import { useTheme } from '@/shared/theme';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VConfirmModal } from '@/shared/ui/VConfirmModal';
import { VSelect } from '@/shared/ui/VSelect';
import { VToggle } from '@/shared/ui/VToggle';
import { formatDisplay, getErrorMessage } from '@/shared/utils';
import { useUpdateCurrency } from '../api/useUpdateCurrency';
import { changePasswordOpenAtom } from '../atoms/profile';
import { ChangePasswordModal } from './ChangePasswordModal';
import styles from './AccountCard.module.css';

const currencyOptions = CURRENCIES.filter((c) =>
  (QUICK_CURRENCIES as readonly string[]).includes(c.code),
).map((c) => ({ value: c.code, label: `${c.name} (${c.symbol})` }));

export const AccountCard = () => {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const currency = useUpdateCurrency();

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useAtom(changePasswordOpenAtom);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const login = user?.login ?? '—';
  const initial = login !== '—' && login ? login[0].toUpperCase() : '?';
  const createdAt = profile?.created_at ? formatDisplay(profile.created_at.slice(0, 10)) : null;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
      setIsLogoutConfirmOpen(false);
    }
  };

  return (
    <VCard className={styles.card}>
      <div className={styles.root}>
        <div className={styles.hero}>
          <div className={styles.heroMain}>
            <div className={styles.avatar} aria-hidden="true">
              {initial}
            </div>
            <div className={styles.heroText}>
              <span className={styles.heroLabel}>Логин</span>
              <h2 className={styles.login}>{login}</h2>
              {createdAt && <span className={styles.heroMeta}>На сайте с {createdAt}</span>}
            </div>
          </div>
        </div>

        <section aria-label="Настройки профиля" className={styles.settingsGroup}>
          <div className={styles.settingsGrid}>
            <VToggle
              className={styles.themeToggle}
              label={
                <span className={styles.themeText}>
                  <span className={styles.themeLabel}>Тёмная тема</span>
                  <span className={styles.themeHint}>Светлое или тёмное оформление</span>
                </span>
              }
              checked={theme === 'dark'}
              onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />

            <div className={styles.currencyField}>
              <VSelect
                label="Основная валюта"
                options={currencyOptions}
                value={profile?.currency ?? ''}
                disabled={currency.isPending || !profile}
                onChange={(value) => currency.mutate(value || null)}
              />
            </div>
          </div>

          {currency.error && (
            <VBanner type="error" visible message={getErrorMessage(currency.error)} />
          )}

          <div className={styles.quickActions}>
            <VButton variant="secondary" onClick={() => setIsChangePasswordOpen(true)}>
              Сменить пароль
            </VButton>
            <VButton
              variant="secondary"
              onClick={() => setIsLogoutConfirmOpen(true)}
              isDisabled={isSigningOut}
            >
              Выйти
            </VButton>
          </div>
        </section>
      </div>

      <ChangePasswordModal
        visible={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      <VConfirmModal
        visible={isLogoutConfirmOpen}
        title="Выйти из аккаунта"
        message="Вы действительно хотите выйти из аккаунта?"
        confirmLabel="Выйти"
        cancelLabel="Отмена"
        isLoading={isSigningOut}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleSignOut}
      />
    </VCard>
  );
};
