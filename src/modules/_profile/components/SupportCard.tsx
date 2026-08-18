import commonStyles from '@/shared/styles/common.module.css';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { useNavigate } from 'react-router-dom';
import styles from './SupportCard.module.css';

export const SupportCard = () => {
  const navigate = useNavigate();

  return (
    <VCard className={styles.body}>
      <div className={commonStyles.titleL}>Поддержка</div>
      <div className={styles.text}>
        Возникла проблема или есть вопрос? Свяжитесь с администратором.
      </div>
      <div>
        <VButton onClick={() => navigate('/support')}>Написать в поддержку</VButton>
      </div>
    </VCard>
  );
};