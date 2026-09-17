import { AsyncPage } from '@/shared/ui/AsyncPage';
import { Route } from 'react-router-dom';

const Page = AsyncPage(() => import('./page'));

export function legal() {
  return (
    <Route>
      <Route path="/legal/:documentSlug" element={<Page />} />
      <Route path="/legal/:documentSlug/:version" element={<Page />} />
    </Route>
  );
}
