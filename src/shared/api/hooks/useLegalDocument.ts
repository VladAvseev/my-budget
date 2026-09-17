import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';

export interface LegalDocument {
  documentType: string;

  version: string;
  publishedAt: string;
  content: string;
  contentHash: string;
}

export const legalDocumentQueryKey = (documentType: string, version = 'current') =>
  ['legal', documentType, version] as const;

export type UseLegalDocumentResponse = LegalDocument;

export const useLegalDocument = (documentType: string, version = 'current') =>
  useQuery<UseLegalDocumentResponse>({
    queryKey: legalDocumentQueryKey(documentType, version),
    queryFn: ({ signal }) =>
      api.publicGet<LegalDocument>(`/legal/${documentType}/${version}`, { signal }),

    staleTime: 60_000,
  });
