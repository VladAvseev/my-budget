import { getCurrencyByCode } from '@/shared/constants/currencies';
import { formatCurrencyRate, getOtherCurrencyRates } from '@/shared/utils';
import styles from './VCurrencyRates.module.css';

export interface VCurrencyRatesProps {
  selectedCurrency: string | null;
  rates?: Record<string, number>;
  orientation?: 'stack' | 'row';
  className?: string;
}

export const VCurrencyRates = ({
  selectedCurrency,
  rates,
  orientation = 'row',
  className,
}: VCurrencyRatesProps) => {
  const target = getCurrencyByCode(selectedCurrency);
  const items = getOtherCurrencyRates(selectedCurrency, rates);

  if (!target || items.length === 0) {
    return null;
  }

  return (
    <div
      className={`${styles.container} ${
        orientation === 'stack' ? styles.stack : styles.row
      }${className ? ` ${className}` : ''}`}
    >
      {items.map(({ from, value }) => (
        <div key={from.code} className={styles.item}>
          <span className={styles.from}>1&nbsp;{from.symbol}</span>
          <span className={styles.equals}>=</span>
          <span className={styles.value}>
            {formatCurrencyRate(value)}&nbsp;{target.symbol}
          </span>
        </div>
      ))}
    </div>
  );
};
