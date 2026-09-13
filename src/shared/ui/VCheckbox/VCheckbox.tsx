import type { ChangeEvent, ReactNode } from 'react';
import { useState } from 'react';
import styles from './VCheckbox.module.css';

export interface VCheckboxProps {
  /** Controlled-режим: undefined — компонент сам хранит состояние. */
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Подпись справа от square (ReactNode — в неё кладут ссылку на документ). */
  children?: ReactNode;
  className?: string;
}

/**
 * Нативный чекбокс, стилизованный accent-цветом темы.
 *
 * Используется там, где по закону требуется осознанное действие пользователя
 * (согласие на обработку ПДн): по умолчанию НЕ отмечен, состояние управляется
 * формой, клик по подписи переключает так же, как клик по квадратику.
 */
export const VCheckbox = ({
  checked,
  defaultChecked,
  onChange,
  disabled,
  children,
  className,
}: VCheckboxProps) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);

  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.checked;
    if (!isControlled) {
      setInternalChecked(next);
    }
    onChange?.(next);
  };

  return (
    <label className={`${styles.root}${className ? ` ${className}` : ''}`}>
      <input
        type="checkbox"
        className={styles.input}
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
      />
      {children && <span className={styles.label}>{children}</span>}
    </label>
  );
};
