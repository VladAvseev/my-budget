import { BanknotesIcon } from '@/shared/icons';
import { Link } from 'react-router-dom';
import styles from './VBrand.module.css';

export interface VBrandProps {
  
  to?: string;
  className?: string;
}


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
