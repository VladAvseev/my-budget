import { ChevronLeftIcon } from '@/shared/icons';
import { useThemeStyles } from '@/shared/theme';
import { VIconButton } from '@/shared/ui/VIconButton';

interface BackButtonProps {
  ariaLabel: string;
  onClick: () => void;
}

export const BackButton = ({ ariaLabel, onClick }: BackButtonProps) => {
  const styles = useThemeStyles();

  return (
    <VIconButton ariaLabel={ariaLabel} onClick={onClick} color={styles.colors.textPrimary}>
      <ChevronLeftIcon size={24} color={styles.colors.textPrimary} />
    </VIconButton>
  );
};
