import { CheckIcon } from '@/shared/icons';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { useNavigate } from 'react-router-dom';
import { useCompleteOnboarding } from '../api/useCompleteOnboarding';
import { useOnboardingChecklist } from '../api/useOnboardingChecklist';
import styles from '../homeCard.module.css';

export const OnboardingCard = () => {
  const navigate = useNavigate();
  const { items, allDone, onboarded, isLoading, error } = useOnboardingChecklist();
  const completeOnboarding = useCompleteOnboarding();

  if (onboarded || error || isLoading) {
    return null;
  }

  return (
    <VCard className={`${styles.cardGrow} ${styles.animateCard}`} style={{ animationDelay: '0.06s' }}>
      <div className={styles.title}>С чего начать?</div>

      <div className={styles.checklist}>
        {items.map((item) => (
          <div key={item.id} className={styles.checklistItem}>
            <div
              className={`${styles.checklistLabel}${item.done ? ` ${styles.checklistLabelDone}` : ` ${styles.checklistLabelPending}`}`}
            >
              {item.label}
            </div>
            <CheckIcon
              size={18}
              color={item.done ? 'var(--color-success)' : 'var(--color-text-secondary)'}
            />
          </div>
        ))}
      </div>

      {allDone ? (
        <VButton onClick={() => completeOnboarding.mutate()} isLoading={completeOnboarding.isPending}>
          Завершить
        </VButton>
      ) : (
        <div className={styles.buttonRow}>
          <VButton variant="secondary" onClick={() => completeOnboarding.mutate()} isLoading={completeOnboarding.isPending}>
            Пропустить
          </VButton>
          <VButton onClick={() => navigate('/help')}>
            Помощь
          </VButton>
        </div>
      )}
    </VCard>
  );
};