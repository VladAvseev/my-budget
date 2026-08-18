import { AsyncPage } from '@/shared/ui/AsyncPage';
import { Route } from 'react-router-dom';

const Page = AsyncPage(() => import('./page'));

export function support() {
  return <Route path="support" element={<Page />} />;
}