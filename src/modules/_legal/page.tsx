import { LegalDocumentView } from '@/shared/api/components/LegalDocumentView';
import { getLegalDocumentBySlug } from '@/shared/legal/documents';
import commonStyles from '@/shared/styles/common.module.css';
import { VCard } from '@/shared/ui/VCard';
import { useParams } from 'react-router-dom';
import styles from './page.module.css';

export const Page: React.FC = () => {
  const { documentSlug = '', version } = useParams();
  const document = getLegalDocumentBySlug(documentSlug);

  return (
    <div className={commonStyles.centeredContent}>
      <div className={styles.card}>
        <VCard>
          <h1 className={commonStyles.cardTitle}>{document?.title ?? 'Документ не найден'}</h1>
          {document ? (
            <LegalDocumentView documentType={document.documentType} version={version} />
          ) : (
            <p className={commonStyles.emptyHint}>Такой юридический документ не опубликован.</p>
          )}
        </VCard>
      </div>
    </div>
  );
};
