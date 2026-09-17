export type LegalDocumentType = 'privacy_policy' | 'terms_of_use';

export interface LegalDocumentMeta {

  documentType: LegalDocumentType;

  slug: string;

  title: string;

  gating: boolean;
}

export const GATING_DOCUMENT_TYPE: LegalDocumentType = 'privacy_policy';

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

export const legalDocumentPath = (documentType: LegalDocumentType, version?: string): string => {
  const slug = getLegalDocumentByType(documentType)?.slug ?? documentType.replace(/_/gu, '-');
  return version ? `/legal/${slug}/${encodeURIComponent(version)}` : `/legal/${slug}`;
};
