import { useAuth } from '@/shared/supabase/authProvider';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import commonStyles from '@/shared/styles/common.module.css';
import { useAtom } from 'jotai';
import { changePasswordOpenAtom } from '../atoms/profile';
import { ChangePasswordModal } from './ChangePasswordModal';

export const AccountCard = () => {
  const { user } = useAuth();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useAtom(changePasswordOpenAtom);

  return (
    <VCard>
      <div className={commonStyles.columnL}>
        <div className={commonStyles.titleXl}>Аккаунт</div>

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
  return (
    <div className={commonStyles.infoRow}>
      <span className={commonStyles.infoLabel}>{label}</span>
      <span className={commonStyles.infoValue}>{value}</span>
    </div>
  );
};