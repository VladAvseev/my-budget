import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';

/**
 * Юридические документы (согласие на обработку ПДн и т.п.) — публичный
 * GET /legal/:documentType/current со серверного модуля _legal. Текст —
 * Markdown; HTML рендерит клиент (LegalDocumentView), сервер хранит только
 * content + sha256-хэш (contentHash — как ETag: пока он не изменился,
 * скачивать контент заново незачем).
 */

/** Ответ сервера (camelCase, см. server/src/modules/_legal/types.ts). */
export interface LegalDocument {
  documentType: string;
  /** Версия-дата публикации, например '2026-09-12'. */
  version: string;
  publishedAt: string;
  content: string;
  contentHash: string;
}

export const legalDocumentQueryKey = (documentType: string, version = 'current') =>
  ['legal', documentType, version] as const;

/** Данные хука: текст текущей (или конкретной исторической) версии документа. */
export type UseLegalDocumentResponse = LegalDocument;

export const useLegalDocument = (documentType: string, version = 'current') =>
  useQuery<UseLegalDocumentResponse>({
    queryKey: legalDocumentQueryKey(documentType, version),
    queryFn: ({ signal }) =>
      api.publicGet<LegalDocument>(`/legal/${documentType}/${version}`, { signal }),
    // Текст меняется только при публикации CLI — перепроверка раз в минуту
    // с лихвой покрывает и «согласие на устаревшую версию» (гейт всё равно
    // сверяет currentVersion со статусом).
    staleTime: 60_000,
  });
