import { useAuth } from '@/shared/supabase/authProvider';
import { useThemeStyles } from '@/shared/theme';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { useAtom } from 'jotai';
import { changePasswordOpenAtom } from '../atoms/profile';
import { ChangePasswordModal } from './ChangePasswordModal';

export const AccountCard = () => {
  const styles = useThemeStyles();
  const { user } = useAuth();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useAtom(changePasswordOpenAtom);

  return (
    <VCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.l }}>
        <div
          style={{
            fontSize: styles.typography.fontSize.xl,
            fontWeight: styles.typography.fontWeight.bold,
            color: styles.colors.textPrimary,
          }}
        >
          Аккаунт
        </div>

        <InfoRow label="Email" value={user?.email ?? '—'} />

        <div>
          <VButton variant="secondary" onClick={() => setIsChangePasswordOpen(true)}>
            Сменить пароль
          </VButton>
        </div>
      </div>

      <ChangePasswordModal
        visible={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </VCard>
  );
};

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow = ({ label, value }: InfoRowProps) => {
  const styles = useThemeStyles();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: styles.spacing.m,
      }}
    >
      <span style={{ fontSize: styles.typography.fontSize.m, color: styles.colors.textSecondary }}>
        {label}
      </span>
      <span style={{ fontSize: styles.typography.fontSize.m, color: styles.colors.textPrimary }}>
        {value}
      </span>
    </div>
  );
};
