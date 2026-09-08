import { BackButton } from '@/shared/ui/BackButton';
import styles from './VPageHeader.module.css';

export interface VPageHeaderProps {
  title: string;
  onBack?: () => void;
  backAriaLabel?: string;
  className?: string;
  hideOnMobile?: boolean;
}

export const VPageHeader = ({
  title,
  onBack,
  backAriaLabel,
  className,
  hideOnMobile,
}: VPageHeaderProps) => {
  return (
    <div
      className={`${styles.header}${hideOnMobile ? ` ${styles.hideOnMobile}` : ''}${
        className ? ` ${className}` : ''
      }`}
    >
      <div className={styles.left}>
        {onBack && <BackButton ariaLabel={backAriaLabel ?? 'Назад'} onClick={onBack} />}
        <div className={styles.title}>{title}</div>
      </div>
    </div>
  );
};
