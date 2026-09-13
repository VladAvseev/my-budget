import { AsyncPage } from '@/shared/ui/AsyncPage';
import { Route } from 'react-router-dom';

const Page = AsyncPage(() => import('./page'));

/**
 * Публичные страницы юридических документов (/legal/privacy-policy, …) —
 * без гардов: текст доступен и незалогиненным на форме регистрации (п.2
 * требований). Второй путь — просмотр конкретной исторической версии
 * (/legal/privacy-policy/2026-09-12): так пользователь видит текст, с которым
 * он согласился (п.2: эндпоинт /:version — «для споров»). Текст нигде не
 * дублируется: страница фетчит версию из API тем же LegalDocumentView, что и
 * consent-gate.
 */
export function legal() {
  return (
    <Route>
      <Route path="/legal/:documentSlug" element={<Page />} />
      <Route path="/legal/:documentSlug/:version" element={<Page />} />
    </Route>
  );
}
