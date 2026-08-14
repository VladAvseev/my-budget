import { AppLayout } from '@/shared/layout/AppLayout';
import { ProtectedRoute } from '@/shared/supabase/components/ProtectedRoute';
import { Route } from 'react-router-dom';
import { Page } from './page';
import { report, reportSettings } from './_report';

export function reports() {
  return (
    <Route>
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Page />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      {report()}
      {reportSettings()}
    </Route>
  );
}