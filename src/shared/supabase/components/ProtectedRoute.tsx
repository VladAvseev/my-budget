// src/components/ProtectedRoute.tsx
import commonStyles from '@/shared/styles/common.module.css';
import { VLoader } from '@/shared/ui/VLoader';
import type { ReactNode } from 'react';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../authProvider';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className={commonStyles.centeredContent}>
        <VLoader size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
