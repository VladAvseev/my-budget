import { PublicRoute } from '@/shared/supabase/components/PublicRoute';
import { Route } from 'react-router-dom';
import { Page } from './page';

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
