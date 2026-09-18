import { AppLayout } from '@/modules/_appLayout';
import { ProtectedRoute } from '@/shared/api/components/ProtectedRoute';
import { AsyncPage } from '@/shared/ui/AsyncPage';
import { Route } from 'react-router-dom';
import { report, reportSettings } from './_report';

const Page = AsyncPage(() => import('./page'));

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
