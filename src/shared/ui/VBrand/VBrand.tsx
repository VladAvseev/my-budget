import { BanknotesIcon } from '@/shared/icons';
import { Link } from 'react-router-dom';
import styles from './VBrand.module.css';

export interface VBrandProps {
  /** Если задан — бренд рендерится ссылкой (лендинг, auth-экраны). */
  to?: string;
  className?: string;
}

/**
 * Единый бренд «Мои финансы»: иконка `BanknotesIcon 24` в `primary` + текст
 * 20px `title-medium-emphasized` в `on-surface`, `gap 8px`. Эталон — шапка
 * `AppLayout`; используется там же, в лендинге и на auth-экранах, чтобы шапки
 * не разъезжались.
 */
export const VBrand = ({ to, className }: VBrandProps) => {
  const content = (
    <>
      <BanknotesIcon size={24} />
      <span className={styles.title}>Мои финансы</span>
    </>
  );
  const classNameMerged = `${styles.brand}${className ? ` ${className}` : ''}`;

  if (to) {
    return (
      <Link to={to} className={classNameMerged} aria-label="Мои финансы — на главную">
        {content}
      </Link>
    );
  }

  return <span className={classNameMerged}>{content}</span>;
};
