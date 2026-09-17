import { Link } from 'react-router-dom';
import { LEGAL_DOCUMENTS, type LegalDocumentType } from './documents';

export interface LegalLinksProps {

  className?: string;

  itemClassName?: string;

  types?: readonly LegalDocumentType[];
}

export const LegalLinks = ({ className, itemClassName, types }: LegalLinksProps) => (
  <nav className={className}>
    {LEGAL_DOCUMENTS.filter((document) => !types || types.includes(document.documentType)).map(
      (document) => (
        <Link
          key={document.slug}
          to={`/legal/${document.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={itemClassName}
        >
          {document.title}
        </Link>
      ),
    )}
  </nav>
);
