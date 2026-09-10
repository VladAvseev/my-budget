import { AppLayout } from '@/shared/layout/AppLayout';
import { RoleRoute } from '@/shared/api/components/RoleRoute';
import { Navigate, Route } from 'react-router-dom';
import { dashboard } from './_dashboard';
import { logs } from './_logs';
import { users } from './_users';
import { AdminLayout } from './AdminLayout';

export function admin() {
  return (
    <Route>
      <Route
        path="/admin"
        element={
          <RoleRoute>
            <AppLayout>
              <AdminLayout />
            </AppLayout>
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        {dashboard()}
        {users()}
        {logs()}
      </Route>
    </Route>
  );
}
