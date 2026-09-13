import { useAuth } from '@/shared/api/authProvider';
import {
  useConsentStatus,
  useDeleteAccount,
  useGrantConsent,
  type ConsentStatus,
} from '@/shared/api/hooks/useConsent';
import { GATING_DOCUMENT_TYPE, legalDocumentPath } from '@/shared/legal/documents';
import { getErrorMessage } from '@/shared/utils';
import { VButton } from '@/shared/ui/VButton';
import { VCheckbox } from '@/shared/ui/VCheckbox';
import { VConfirmModal } from '@/shared/ui/VConfirmModal';
import { VLoader } from '@/shared/ui/VLoader';
import { VModal } from '@/shared/ui/VModal';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import styles from './ConsentGate.module.css';

/**
 * Рендер Markdown (react-markdown ~190 kB) — ленивый чанк: 99% сессий gate
 * не показываются, тащить парсер в стартовый бандл приложения незачем.
 */
const LegalDocumentView = lazy(async () => {
  const module = await import('./LegalDocumentView');
  return { default: module.LegalDocumentView };
});

/**
 * Consent-gate — блокирующий экран согласия поверх всего приложения (п.5
 * требований). Вешается в App.tsx над <Routes>: срабатывает для любого
 * авторизованного пользователя, независимо от того, с какой страницы он
 * зашёл (включая '/' с AuthSwitch, который ProtectedRoute не использует).
 *
 * NEEDS_CONSENT показывается в трёх сценариях одним механизмом:
 *   * 'missing'         — аккаунт создан до появления документа (ни одной записи);
 *   * 'version_changed' — опубликована новая версия политики;
 *   * 'revoked'         — пользователь отозвал согласие.
 *
 * Гейтящий документ — «Политика конфиденциальности»: её принятие считается
 * согласием на обработку ПДн (отдельного документа на сайте нет).
 *
 * Закрыть окно нельзя (VModal blocking): выбор ограничен «принять»,
 * «выйти» или «удалить аккаунт» (явный путь из п.5). Если другая вкладка/
 * сервер выдаёт 403 CONSENT_REQUIRED (отзыв/публикация вживую), http.ts
 * шлёт событие 'consent-required' — статус перечитывается. Под чекбоксом —
 * ссылки на политику и пользовательское соглашение: полный правовой комплект
 * доступен прямо из окна, а не только со страниц /legal/*.
 *
 * Исключение — публичные страницы /legal/*: там окно НЕ рисуется, иначе
 * переход по ссылке из модалки (в той же или новой вкладке — токен-то общий)
 * упирался бы в то же перекрытие и документ нельзя было бы прочитать.
 * Юридической дыры нет: тексты и так доступны гостям, а бизнес-API по-прежнему
 * закрыт серверным requireConsent; вернёшься на любой другой маршрут — окно
 * на месте (статус согласия перечитывается без перемонтирования гарда).
 */

const INTRO: Record<NonNullable<ConsentStatus['reason']>, string> = {
  missing:
    'Мы добавили юридически значимую Политику конфиденциальности — её принятие ' +
    'считается согласием на обработку персональных данных. Чтобы продолжить ' +
    'пользоваться приложением, прочитайте документ и примите его.',
  version_changed:
    'Мы обновили Политику конфиденциальности. ' +
    'Чтобы продолжить работу, примите её новую версию.',
  revoked:
    'Вы отозвали согласие на обработку персональных данных. Без него мы не можем ' +
    'хранить и обрабатывать ваши данные: примите политику заново или удалите аккаунт.',
};

/** Префикс публичных страниц юридических документов — на нём gate не блокирует. */
const LEGAL_PATH_PREFIX = '/legal';

export const ConsentGate = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const { pathname } = useLocation();
  const statusQuery = useConsentStatus();
  const { refetch } = statusQuery;

  // Серверный requireConsent ответил 403 CONSENT_REQUIRED (например, согласие
  // отозвали из другой вкладки, или опубликовали новую версию) — перечитать
  // статус, не дожидаясь перемонтирования. Гейт слушает только авторизованных:
  // 400 CONSENT_REQUIRED с формы регистрации (без токена) дёргал бы /status
  // вхолостую.
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    const handler = () => {
      void refetch();
    };
    window.addEventListener('consent-required', handler);
    return () => window.removeEventListener('consent-required', handler);
  }, [isAuthenticated, refetch]);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const status = statusQuery.data;
  if (!status?.needsConsent) {
    return <>{children}</>;
  }

  // На /legal/* окно не рисуется: иначе ссылки из самого окна вели бы на
  // страницы, перекрытые тем же окном (см. docstring компонента).
  if (pathname === LEGAL_PATH_PREFIX || pathname.startsWith(`${LEGAL_PATH_PREFIX}/`)) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <ConsentScreen key={`${user?.id}:${status.currentVersion ?? ''}`} status={status} />
    </>
  );
};

/** Само окно: текст + причина + чекбокс (не отмечен) + кнопки решения. */
const ConsentScreen = ({ status }: { status: ConsentStatus }) => {
  const { signOut } = useAuth();
  const [checked, setChecked] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const grant = useGrantConsent();
  const removeAccount = useDeleteAccount();

  const handleAccept = () => {
    setError(undefined);
    grant.mutate(undefined, {
      onError: (err) => setError(getErrorMessage(err)),
    });
  };

  const handleDelete = () => {
    setError(undefined);
    removeAccount.mutate(undefined, {
      onSuccess: () => {
        // Данные уже обезличены на сервере, сессий нет — локальный выход
        // (эмит SIGNED_OUT почистит кэш и уведёт гард на /login).
        setIsDeleteConfirmOpen(false);
        void signOut();
      },
      onError: (err) => {
        setError(getErrorMessage(err));
        setIsDeleteConfirmOpen(false);
      },
    });
  };

  return (
    <>
      <VModal
        visible
        blocking
        width="720px"
        title="Обработка персональных данных"
        onClose={() => undefined}
        error={error}
        footer={
          <>
            <VButton
              variant="secondary"
              onClick={() => void signOut()}
              isDisabled={grant.isPending || removeAccount.isPending}
            >
              Выйти
            </VButton>
            <VButton
              variant="secondary"
              onClick={() => setIsDeleteConfirmOpen(true)}
              isDisabled={grant.isPending || removeAccount.isPending}
            >
              Удалить аккаунт
            </VButton>
            <VButton onClick={handleAccept} isLoading={grant.isPending} isDisabled={!checked}>
              Принять согласие
            </VButton>
          </>
        }
      >
        <div className={styles.body}>
          <p className={styles.intro}>{INTRO[status.reason ?? 'missing']}</p>
          <div className={styles.document}>
            <Suspense
              fallback={
                <div className={styles.loader}>
                  <VLoader size={24} />
                </div>
              }
            >
              <LegalDocumentView documentType={GATING_DOCUMENT_TYPE} />
            </Suspense>
          </div>
          <VCheckbox checked={checked} onChange={setChecked} disabled={grant.isPending}>
            Принимаю{' '}
            <Link
              to={legalDocumentPath(GATING_DOCUMENT_TYPE)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              «Политику конфиденциальности»
            </Link>{' '}
            (даю согласие на обработку персональных данных) и{' '}
            <Link
              to={legalDocumentPath('terms_of_use')}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              «Пользовательское соглашение»
            </Link>
            , подтверждаю, что мне разъяснены их положения
          </VCheckbox>
        </div>
      </VModal>

      <VConfirmModal
        visible={isDeleteConfirmOpen}
        title="Удалить аккаунт"
        message={
          'Аккаунт и все финансовые данные (отчёты, операции, категории, накопления, цели) ' +
          'будут удалены безвозвратно. Выход из всех устройств — немедленный. ' +
          'Отзыв и обезличивание фиксируются в юридическом журнале согласий.'
        }
        confirmLabel="Удалить навсегда"
        cancelLabel="Отмена"
        isLoading={removeAccount.isPending}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};
