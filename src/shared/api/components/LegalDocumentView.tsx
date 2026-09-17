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
  
  version?: string;
}


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
