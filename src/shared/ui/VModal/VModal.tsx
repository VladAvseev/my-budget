import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ClearIcon } from '@/shared/icons';
import { VBanner } from '@/shared/ui/VBanner';
import styles from './VModal.module.css';

export interface VModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  error?: string;
  width?: string;
  style?: CSSProperties;
  className?: string;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const VModal = ({
  visible,
  title,
  onClose,
  children,
  footer,
  error,
  width = '480px',
  style,
  className,
}: VModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!visible) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') {
        return;
      }
      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusables.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return createPortal(
    <div role="presentation" onClick={onClose} className={styles.overlay}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className={`${styles.dialog}${className ? ` ${className}` : ''}`}
        style={{ maxWidth: width, ...style }}
      >
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className={styles.close}
          >
            <ClearIcon size={18} color="currentColor" />
          </button>
        </div>

        {Boolean(error) && (
          <div className={styles.errorArea}>
            <div className={styles.errorTop}>
              <VBanner type="error" visible message={error as string} />
            </div>
          </div>
        )}

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};