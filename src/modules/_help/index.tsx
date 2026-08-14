import { AppLayout } from '@/shared/layout/AppLayout';
import { ProtectedRoute } from '@/shared/supabase/components/ProtectedRoute';
import { Route } from 'react-router-dom';
import { Page } from './page';

export function help() {
  return (
    <Route>
      <Route
        path="/help"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Page />
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Route>
  );
}