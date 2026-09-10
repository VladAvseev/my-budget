import type { ReactNode } from 'react';
import { AppLayout } from '@/shared/layout/AppLayout';
import { AuthSwitch } from '@/shared/api/components/AuthSwitch';
import { AsyncPage } from '@/shared/ui/AsyncPage';
import { Route } from 'react-router-dom';

const Page = AsyncPage(() => import('./page'));

export function home({ guest }: { guest: ReactNode }) {
  return (
    <Route>
      <Route
        path="/"
        element={
          <AuthSwitch
            guest={guest}
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
