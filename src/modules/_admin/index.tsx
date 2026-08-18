import { AppLayout } from '@/shared/layout/AppLayout';
import { RoleRoute } from '@/shared/supabase/components/RoleRoute';
import { Navigate, Route } from 'react-router-dom';
import { dashboard } from './_dashboard';
import { news } from './_news';
import { support } from './_support';
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
        {support()}
        {news()}
      </Route>
    </Route>
  );
}
