import { useAdminStatus } from '@/shared/api/hooks';
import commonStyles from '@/shared/styles/common.module.css';
import { VBrandLoader } from '@/shared/ui/VLoader';
import type { ReactNode } from 'react';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../authProvider';

interface RoleRouteProps {
  children: ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { isAdmin, isLoading } = useAdminStatus();

  if (loading || isLoading) {
    return (
      <div className={commonStyles.centeredContent}>
        <VBrandLoader size={64} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
