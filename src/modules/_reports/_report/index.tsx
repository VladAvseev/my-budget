import { AppLayout } from '@/shared/layout/AppLayout';
import { ProtectedRoute } from '@/shared/supabase/components/ProtectedRoute';
import { Route } from 'react-router-dom';
import { Page } from './page';

export { reportSettings } from './_reportSettings';

export function report() {
  return (
    <Route
      path="/reports/:id"
      element={
        <ProtectedRoute>
          <AppLayout>
            <Page />
          </AppLayout>
        </ProtectedRoute>
      }
    />
  );
}