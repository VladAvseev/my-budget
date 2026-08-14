import { PublicRoute } from '@/shared/supabase/components/PublicRoute';
import { Route } from 'react-router-dom';
import { Page } from './page';

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
