import { AppLayout } from '@/shared/layout/AppLayout';
import { ProtectedRoute } from '@/shared/api/components/ProtectedRoute';
import { AsyncPage } from '@/shared/ui/AsyncPage';
import { Route } from 'react-router-dom';

const Page = AsyncPage(() => import('./page'));

export function capital() {
  return (
    <Route>
      <Route
        path="/capital"
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
