import { Link } from 'react-router-dom';
import { LEGAL_DOCUMENTS, type LegalDocumentType } from './documents';

export interface LegalLinksProps {
  /** Класс контейнера-навигации (CSS-modules вызывающего места). */
  className?: string;
  /** Класс одной ссылки. */
  itemClassName?: string;
  /** Подмножество типов; по умолчанию — все документы реестра. */
  types?: readonly LegalDocumentType[];
}

/**
 * Ссылки на юридические документы реестра `documents.ts` — переиспользуются в
 * футере лендинга и профиле, чтобы список нигде не
 * расходился. Чекбоксы регистрации и consent-gate содержат свои ссылки на оба
 * документа внутри текста. Открываются в новой вкладке: с незавершённой
 * формой регистрации или из модалки gate уходить нельзя. Классы приходят от
 * хоста — визуальных решений здесь нет.
 */
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
