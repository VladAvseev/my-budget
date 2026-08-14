import { PublicRoute } from '@/shared/supabase/components/PublicRoute';
import { AsyncPage } from '@/shared/ui/AsyncPage';
import { Route } from 'react-router-dom';

const Page = AsyncPage(() => import('./page'));

export function registration() {
  return (
    <Route>
      <Route
        path="/registration"
        element={
          <PublicRoute>
            <Page />
          </PublicRoute>
        }
      />
    </Route>
  );
}
