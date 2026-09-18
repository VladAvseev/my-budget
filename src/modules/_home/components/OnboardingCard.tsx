import { useNavigate } from 'react-router-dom';
import { CheckIcon } from '@/shared/icons';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { useCompleteOnboarding } from '../api/useCompleteOnboarding';
import { useOnboardingChecklist } from '../api/useOnboardingChecklist';
import styles from '../homeCard.module.css';

export const OnboardingCard = () => {
  const navigate = useNavigate();
  const { items, nextItem, allDone, onboarded, isLoading, error } = useOnboardingChecklist();
  const completeOnboarding = useCompleteOnboarding();

  if (onboarded || error || isLoading) {
    return null;
  }

  return (
    <VCard className={`${styles.cardGrow} ${styles.onboardingCard}`}>
      <div className={styles.title}>С чего начать?</div>

      <ul className={styles.checklist}>
        {items.map((item) => (
          <li
            key={item.id}
            className={styles.checklistItem}
            aria-current={nextItem?.id === item.id ? 'step' : undefined}
          >
            <div
              className={`${styles.checklistLabel}${item.done ? ` ${styles.checklistLabelDone}` : ` ${styles.checklistLabelPending}`}`}
            >
              {item.label}
            </div>
            <span aria-hidden="true">
              <CheckIcon
                size={18}
                color={item.done ? 'var(--positive-ink)' : 'var(--md-sys-color-on-surface-variant)'}
              />
            </span>
          </li>
        ))}
      </ul>

      {allDone ? (
        <VButton
          onClick={() => completeOnboarding.mutate()}
          isLoading={completeOnboarding.isPending}
        >
          Завершить
        </VButton>
      ) : (
        <div className={styles.buttonRow}>
          <VButton
            variant="secondary"
            onClick={() => completeOnboarding.mutate()}
            isLoading={completeOnboarding.isPending}
          >
            Пропустить
          </VButton>
          {nextItem && (
            <VButton onClick={() => navigate(nextItem.route)}>{nextItem.actionLabel}</VButton>
          )}
        </div>
      )}
    </VCard>
  );
};
