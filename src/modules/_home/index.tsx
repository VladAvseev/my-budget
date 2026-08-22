import { AppLayout } from '@/shared/layout/AppLayout';
import { AuthSwitch } from '@/shared/supabase/components/AuthSwitch';
import { AsyncPage } from '@/shared/ui/AsyncPage';
import { Route } from 'react-router-dom';

const Page = AsyncPage(() => import('./page'));
const LandingPage = AsyncPage(() => import('@/modules/_landing/page'));

export function home() {
  return (
    <Route>
      <Route
        path="/"
        element={
          <AuthSwitch
            guest={<LandingPage />}
            authenticated={
              <AppLayout>
                <Page />
              </AppLayout>
            }
          />
        }
      />
    </Route>
  );
}
