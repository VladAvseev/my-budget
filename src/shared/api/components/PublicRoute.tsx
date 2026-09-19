import commonStyles from '@/shared/styles/common.module.css';
import { VLoader } from '@/shared/ui/VLoader';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../authProvider';

interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className={commonStyles.centeredContent}>
        <VLoader size={32} />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
