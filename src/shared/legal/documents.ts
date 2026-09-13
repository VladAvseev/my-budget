/**
 * Клиентский реестр юридических документов: slug в URL ↔ document_type
 * серверной таблицы legal_documents. Текстов здесь нет и быть не должно —
 * контент публикуется в БД только CLI server/ (npm run legal:publish), а
 * рендерит его единый LegalDocumentView. Здесь — только идентификаторы и
 * заголовки, чтобы ссылки (футер, регистрация, gate, профиль) и страница
 * /legal/* не расходились по проекту.
 */

/** document_type, которые знает клиент (зеркало KNOWN_DOCUMENT_TYPES на сервере). */
export type LegalDocumentType = 'privacy_policy' | 'terms_of_use';

export interface LegalDocumentMeta {
  /** document_type в серверном реестре legal_documents. */
  documentType: LegalDocumentType;
  /** Сегмент URL /legal/:documentSlug. */
  slug: string;
  /** Заголовок страницы и текст ссылки (именительный падеж). */
  title: string;
  /** true — документ гейтит доступ (consent-gate + requireConsent). */
  gating: boolean;
}

/**
 * Единственный гейтящий документ — «Политика конфиденциальности»: её принятие
 * в gate'е и при регистрации юридически считается согласием на обработку ПДн
 * (отдельного документа «Согласие на обработку ПДн» на сайте нет).
 */
export const GATING_DOCUMENT_TYPE: LegalDocumentType = 'privacy_policy';

/** Порядок = порядок ссылок в футере/профиле. */
export const LEGAL_DOCUMENTS: readonly LegalDocumentMeta[] = [
  {
    documentType: 'privacy_policy',
    slug: 'privacy-policy',
    title: 'Политика конфиденциальности',
    gating: true,
  },
  {
    documentType: 'terms_of_use',
    slug: 'terms-of-use',
    title: 'Пользовательское соглашение',
    gating: false,
  },
];

export const getLegalDocumentBySlug = (slug: string): LegalDocumentMeta | undefined =>
  LEGAL_DOCUMENTS.find((document) => document.slug === slug);

export const getLegalDocumentByType = (
  documentType: LegalDocumentType,
): LegalDocumentMeta | undefined =>
  LEGAL_DOCUMENTS.find((document) => document.documentType === documentType);

/** Путь страницы документа; version — просмотр конкретной (в т.ч. исторической) версии. */
export const legalDocumentPath = (documentType: LegalDocumentType, version?: string): string => {
  const slug = getLegalDocumentByType(documentType)?.slug ?? documentType.replace(/_/gu, '-');
  return version ? `/legal/${slug}/${encodeURIComponent(version)}` : `/legal/${slug}`;
};
