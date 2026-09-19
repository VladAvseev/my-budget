import { AppLayout } from '@/modules/_appLayout';
import { ProtectedRoute } from '@/shared/api/components/ProtectedRoute';
import { AsyncPage } from '@/shared/ui/AsyncPage';
import { Route } from 'react-router-dom';

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
