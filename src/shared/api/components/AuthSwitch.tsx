import commonStyles from '@/shared/styles/common.module.css';
import { VLoader } from '@/shared/ui/VLoader';
import type { ReactNode } from 'react';
import { useAuth } from '../authProvider';

interface AuthSwitchProps {
  guest: ReactNode;
  authenticated: ReactNode;
}

export const AuthSwitch: React.FC<AuthSwitchProps> = ({ guest, authenticated }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className={commonStyles.centeredContent}>
        <VLoader size={32} />
      </div>
    );
  }

  return <>{isAuthenticated ? authenticated : guest}</>;
};
