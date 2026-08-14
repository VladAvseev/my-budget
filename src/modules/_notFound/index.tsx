import { Route } from 'react-router-dom';
import { Page } from './page';

export function notFound() {
  return (
    <Route
      path="*"
      element={<Page />}
    />
  );
}