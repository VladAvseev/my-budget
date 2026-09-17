import { cloneElement, isValidElement, useId, type CSSProperties, type ReactNode } from 'react';
import styles from './VHint.module.css';

export type VHintPosition =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'right-start'
  | 'right-center'
  | 'right-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end'
  | 'left-start'
  | 'left-center'
  | 'left-end';

export interface VHintProps {
  children: ReactNode;
  hint: ReactNode;
  position?: VHintPosition;
  minWidth?: number | string;
  maxWidth?: number | string;
  className?: string;
  style?: CSSProperties;
}

const defaultMinWidth = 150;
const defaultMaxWidth = 300;

export const VHint = ({
  children,
  hint,
  position = 'top-center',
  minWidth = defaultMinWidth,
  maxWidth = defaultMaxWidth,
  className,
  style,
}: VHintProps) => {
  const tooltipStyle: CSSProperties = {
    minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
  };
  const tooltipId = useId();

  const describedChildren = isValidElement<{ 'aria-describedby'?: string }>(children)
    ? cloneElement(children, {
        'aria-describedby': [children.props['aria-describedby'], tooltipId]
          .filter(Boolean)
          .join(' '),
      })
    : children;

  return (
    <span className={`${styles.wrapper}${className ? ` ${className}` : ''}`} style={style}>
      {describedChildren}
      <span
        id={tooltipId}
        className={`${styles.tooltip} ${styles[position]}`}
        role="tooltip"
        style={tooltipStyle}
      >
        {hint}
      </span>
    </span>
  );
};
