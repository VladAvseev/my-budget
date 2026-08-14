import type { HTMLAttributes } from 'react';
import styles from './VCard.module.css';

export interface VCardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const VCard = ({ interactive, children, style, ...rest }: VCardProps) => {
  const isInteractive = interactive || Boolean(rest.onClick) || rest.role === 'button';
  const { className: passedClassName, ...restProps } = rest;

  return (
    <div
      {...restProps}
      className={`${styles.card}${isInteractive ? ` ${styles.interactive}` : ''}${passedClassName ? ` ${passedClassName}` : ''}`}
      style={style}
    >
      {children}
    </div>
  );
};
