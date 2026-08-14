import { CheckIcon } from '@/shared/icons';
import { useThemeStyles } from '@/shared/theme';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { useCompleteOnboarding } from '../api/useCompleteOnboarding';
import { useOnboardingChecklist } from '../api/useOnboardingChecklist';

export const OnboardingCard = () => {
  const styles = useThemeStyles();
  const { items, allDone, onboarded, isLoading, error } = useOnboardingChecklist();
  const completeOnboarding = useCompleteOnboarding();

  if (onboarded || error || isLoading) {
    return null;
  }

  return (
    <VCard
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: styles.spacing.l,
        height: '100%',
        flex: '1 1 300px',
        minWidth: 300,
      }}
    >
      <div
        style={{
          fontSize: styles.typography.fontSize.l,
          fontWeight: styles.typography.fontWeight.bold,
          color: styles.colors.textPrimary,
        }}
      >
        С чего начать?
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.s }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: styles.spacing.m,
            }}
          >
            <div
              style={{
                fontSize: styles.typography.fontSize.s,
                color: item.done ? styles.colors.textPrimary : styles.colors.textSecondary,
              }}
            >
              {item.label}
            </div>
            {item.done && (
              <CheckIcon size={18} color={styles.colors.accent} style={{ flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <VButton
          variant={allDone ? 'primary' : 'secondary'}
          onClick={() => completeOnboarding.mutate()}
          isLoading={completeOnboarding.isPending}
        >
          {allDone ? 'Завершить' : 'Пропустить'}
        </VButton>
      </div>
    </VCard>
  );
};
