import { BackButton } from '@/shared/ui/BackButton';
import type { ReactNode } from 'react';
import styles from './VPageHeader.module.css';

export interface VPageHeaderProps {
  title: string;
  onBack?: () => void;
  backAriaLabel?: string;
  right?: ReactNode;
  className?: string;
}

export const VPageHeader = ({ title, onBack, backAriaLabel, right, className }: VPageHeaderProps) => {
  return (
    <div className={`${styles.header}${className ? ` ${className}` : ''}`}>
      <div className={styles.left}>
        {onBack && (
          <BackButton ariaLabel={backAriaLabel ?? 'Назад'} onClick={onBack} />
        )}
        <div className={styles.title}>{title}</div>
      </div>
      {right}
    </div>
  );
};