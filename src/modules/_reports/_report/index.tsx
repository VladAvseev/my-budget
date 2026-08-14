import { AppLayout } from '@/shared/layout/AppLayout';
import { ProtectedRoute } from '@/shared/supabase/components/ProtectedRoute';
import { AsyncPage } from '@/shared/ui/AsyncPage';
import { Route } from 'react-router-dom';

export { reportSettings } from './_reportSettings';

const Page = AsyncPage(() => import('./page'));

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