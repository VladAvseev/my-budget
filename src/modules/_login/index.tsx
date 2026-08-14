import { PublicRoute } from '@/shared/supabase/components/PublicRoute';
import { AsyncPage } from '@/shared/ui/AsyncPage';
import { Route } from 'react-router-dom';

const Page = AsyncPage(() => import('./page'));

export function login() {
  return (
    <Route>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Page />
          </PublicRoute>
        }
      />
    </Route>
  );
}
