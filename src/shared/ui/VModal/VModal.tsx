import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ClearIcon } from '@/shared/icons';
import { useThemeStyles } from '@/shared/theme';
import { VBanner } from '@/shared/ui/VBanner';

export interface VModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  error?: string;
  width?: string;
  style?: CSSProperties;
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
}: VModalProps) => {
  const styles = useThemeStyles();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  const modalStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: width,
    maxHeight: 'calc(100vh - 48px)',
    backgroundColor: styles.colors.bgSurface,
    borderRadius: styles.radius.l,
    boxShadow: styles.shadow.l,
    animation: 'vmodal-in 0.2s ease',
    ...style,
  };

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
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: styles.spacing.xl,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        animation: 'vmodal-overlay-in 0.2s ease',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        style={modalStyle}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: styles.spacing.m,
            padding: `${styles.spacing.l} ${styles.spacing.xl}`,
            borderBottom: `1px solid ${styles.colors.border}`,
          }}
        >
          <div
            style={{
              fontSize: styles.typography.fontSize.xl,
              fontWeight: styles.typography.fontWeight.bold,
              color: styles.colors.textPrimary,
            }}
          >
            {title}
          </div>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: styles.spacing.xs,
              border: 'none',
              borderRadius: styles.radius.s,
              background: 'transparent',
              color: styles.colors.textSecondary,
              cursor: 'pointer',
            }}
          >
            <ClearIcon size={18} color="currentColor" />
          </button>
        </div>

        {Boolean(error) && (
          <div style={{ padding: `0 ${styles.spacing.xl}` }}>
            <div style={{ paddingTop: styles.spacing.l }}>
              <VBanner type="error" visible message={error as string} />
            </div>
          </div>
        )}

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: `${styles.spacing.l} ${styles.spacing.xl}`,
            color: styles.colors.textPrimary,
            fontSize: styles.typography.fontSize.m,
          }}
        >
          {children}
        </div>

        {footer && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: styles.spacing.m,
              padding: `${styles.spacing.l} ${styles.spacing.xl}`,
              borderTop: `1px solid ${styles.colors.border}`,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};