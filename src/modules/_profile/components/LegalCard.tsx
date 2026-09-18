import { Link } from 'react-router-dom';
import { useConsentStatus } from '@/shared/api/hooks';
import { GATING_DOCUMENT_TYPE, legalDocumentPath } from '@/shared/legal/documents';
import { LegalLinks } from '@/shared/legal/LegalLinks';
import { VCard } from '@/shared/ui/VCard';
import styles from './LegalCard.module.css';

export const LegalCard = () => {
  const { data: consentStatus } = useConsentStatus();

  return (
    <VCard className={styles.card}>
      <div className={styles.root}>
        <h3 className={styles.title}>Правовые документы</h3>
        <LegalLinks className={styles.nav} itemClassName={styles.link} />
        {consentStatus?.grantedVersion && (
          <span className={styles.consentLine}>
            Согласие на обработку ПДн (политика конфиденциальности) принято для версии{' '}
            <Link
              to={legalDocumentPath(GATING_DOCUMENT_TYPE, consentStatus.grantedVersion)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {consentStatus.grantedVersion}
            </Link>
          </span>
        )}
      </div>
    </VCard>
  );
};
