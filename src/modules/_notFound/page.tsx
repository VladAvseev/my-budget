import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import commonStyles from '@/shared/styles/common.module.css';
import { useNavigate } from 'react-router-dom';
import styles from './page.module.css';

export const Page: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={commonStyles.centeredContent}>
      <div className={commonStyles.centeredCard}>
        <VCard className={styles.card}>
          <div className={styles.code}>404</div>
          <div className={styles.text}>Страница не найдена</div>
          <VButton onClick={() => navigate('/')}>Перейти на главную</VButton>
        </VCard>
      </div>
    </div>
  );
};