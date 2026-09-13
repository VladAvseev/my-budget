import { formatDisplay } from '@/shared/utils';
import { legalDocumentPath, type LegalDocumentType } from '@/shared/legal/documents';
import { VButton } from '@/shared/ui/VButton';
import { VLoader } from '@/shared/ui/VLoader';
import { useLegalDocument } from '@/shared/api/hooks/useLegalDocument';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import type { ComponentProps } from 'react';
import styles from './LegalDocumentView.module.css';

/**
 * Ссылки внутри markdown-текста документа: относительные (/legal/...) ведут
 * через react-router без перезагрузки SPA (важно и для документа внутри
 * ConsentGate), внешние http(s) открываются в новой вкладке, mailto/tel —
 * обычным <a> (перехватывать их роутером смысла нет).
 */
const DocumentLink = ({ href, children }: ComponentProps<'a'>) => {
  if (href?.startsWith('/')) {
    return <Link to={href}>{children}</Link>;
  }
  if (href?.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return <a href={href}>{children}</a>;
};

export interface LegalDocumentViewProps {
  documentType: LegalDocumentType;
  /** Конкретная (в т.ч. историческая) версия; пусто/'current' — действующая. */
  version?: string;
}

/**
 * Рендер юридического документа из БД (Markdown → React через react-markdown).
 *
 * Единая точка вывода текста для страницы /legal/*, consent-gate и любых
 * будущих мест: копия текста в компоненте не дублируется нигде (п.2
 * требований). react-markdown не исполняет raw HTML по умолчанию — санитайзер
 * не нужен, XSS из Markdown-исходника исключён.
 */
export const LegalDocumentView = ({ documentType, version }: LegalDocumentViewProps) => {
  const { data, isPending, isError, refetch } = useLegalDocument(
    documentType,
    version || 'current',
  );

  if (isPending) {
    return (
      <div className={styles.center}>
        <VLoader size={24} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={`${styles.center} ${styles.error}`}>
        <span>Не удалось загрузить текст документа.</span>
        <VButton variant="secondary" onClick={() => void refetch()}>
          Повторить
        </VButton>
      </div>
    );
  }

  return (
    <article className={styles.document}>
      {version && version !== 'current' && (
        <p className={styles.historical}>
          Вы просматриваете историческую версию документа — так выглядел текст на момент, указанный
          ниже. <Link to={legalDocumentPath(documentType)}>Открыть действующую версию</Link>
        </p>
      )}
      <div className={styles.meta}>
        Версия {data.version} · опубликован {formatDisplay(data.publishedAt.slice(0, 10))}
      </div>
      <Markdown remarkPlugins={[remarkGfm]} components={{ a: DocumentLink }}>
        {data.content}
      </Markdown>
    </article>
  );
};
