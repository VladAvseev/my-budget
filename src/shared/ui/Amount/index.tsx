import { BynIcon } from '@/shared/icons/BynIcon';
import { formatAmount, type ConvertOptions } from '@/shared/utils/format';
import styles from '@/shared/ui/Amount/Amount.module.css';

/** Строка остаётся пригодной для копирования; знак отображается отдельным SVG. */
export const CurrencyText = ({ children }: { children: string }) => (
  <>
    {children.split(/(\bBYN\b)/).map((part, index) =>
      part === 'BYN' ? (
        <span key={index} className={styles.sign}>
          <span className={styles.accessible}>BYN</span>
          <BynIcon className={styles.icon} />
        </span>
      ) : (
        part
      ),
    )}
  </>
);

export interface AmountProps {
  value: number;
  currencySymbol?: string | null;
  convert?: ConvertOptions;
}

export const Amount = ({ value, currencySymbol, convert }: AmountProps) => (
  <CurrencyText>{formatAmount(value, currencySymbol, convert)}</CurrencyText>
);
