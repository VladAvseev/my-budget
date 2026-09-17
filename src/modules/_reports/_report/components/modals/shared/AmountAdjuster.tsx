import { useState } from 'react';
import { MinusIcon, PlusIcon } from '@/shared/icons';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VTextInput } from '@/shared/ui/VTextInput';
import { getAmountError } from './amountValidation';
import styles from './AmountAdjuster.module.css';

interface AmountAdjusterProps {
  amount: string;
  onAmountChange: (next: string, error: string | undefined) => void;
  controlsDisabled: boolean;
}

export const AmountAdjuster = ({
  amount,
  onAmountChange,
  controlsDisabled,
}: AmountAdjusterProps) => {
  const [delta, setDelta] = useState('');

  const trimmedDelta = delta.trim();
  const deltaValue = Number(trimmedDelta);
  const isDeltaUsable =
    trimmedDelta !== '' &&
    getAmountError(trimmedDelta) === undefined &&
    Number.isFinite(deltaValue) &&
    deltaValue > 0;
  const isDisabled = controlsDisabled || !isDeltaUsable;

  const handleAdjust = (sign: -1 | 1) => {
    if (isDisabled) return;
    const trimmedAmount = amount.trim();
    const currentValue = Number(trimmedAmount);
    const base =
      trimmedAmount !== '' && Number.isFinite(currentValue) ? currentValue : 0;
    const next = Math.round((base + sign * deltaValue) * 100) / 100;
    if (next <= 0) {
      onAmountChange(amount, 'Итоговая сумма должна быть больше нуля');
      return;
    }
    onAmountChange(String(next), undefined);
    setDelta('');
  };

  return (
    <div className={styles.group} role="group" aria-label="Коррекция суммы">
      <span className={styles.caption}>Коррекция</span>
      <div className={styles.row}>
        <VTextInput
          numeric
          placeholder="0.00"
          aria-label="Сумма коррекции"
          value={delta}
          disabled={controlsDisabled}
          onChange={setDelta}
          className={styles.delta}
        />
        <VIconButton
          ariaLabel="Уменьшить сумму"
          onClick={() => handleAdjust(-1)}
          isDisabled={isDisabled}
          className={styles.button}
        >
          <MinusIcon size={24} />
        </VIconButton>
        <VIconButton
          ariaLabel="Увеличить сумму"
          onClick={() => handleAdjust(1)}
          isDisabled={isDisabled}
          className={styles.button}
        >
          <PlusIcon size={24} />
        </VIconButton>
      </div>
    </div>
  );
};
