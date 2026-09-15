import { ChevronLeftIcon } from '@/shared/icons';
import { VIconButton } from '@/shared/ui/VIconButton';

interface BackButtonProps {
  ariaLabel: string;
  onClick: () => void;
  className?: string;
}

export const BackButton = ({ ariaLabel, onClick, className }: BackButtonProps) => {
  return (
    <VIconButton
      ariaLabel={ariaLabel}
      onClick={onClick}
      className={className}
      color="var(--md-sys-color-on-surface)"
    >
      <ChevronLeftIcon size={24} color="currentColor" />
    </VIconButton>
  );
};
