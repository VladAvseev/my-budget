import { AppLayout } from '@/shared/layout/AppLayout';
import { ProtectedRoute } from '@/shared/supabase/components/ProtectedRoute';
import { Route } from 'react-router-dom';
import { Page } from './page';

export function overview() {
  return (
    <Route>
      <Route
        path="/overview"
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
