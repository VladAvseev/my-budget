import { MONTHS_RU } from './monthMapping';
import { toISODate } from './date';

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export const isPeriodMonth = (value: string): boolean => MONTH_RE.test(value);

export const currentMonthCode = (now: Date = new Date()): string =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

export const todayISODate = (now: Date = new Date()): string => toISODate(now);

export const monthRange = (month: string): { from: string; to: string } => {
  const [y, m] = month.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const mm = String(m).padStart(2, '0');
  return { from: `${y}-${mm}-01`, to: `${y}-${mm}-${String(lastDay).padStart(2, '0')}` };
};

export const formatMonthTitle = (month: string): string => {
  if (!isPeriodMonth(month)) return month;
  const [y, m] = month.split('-').map(Number);
  return `${MONTHS_RU[m - 1]} ${y}`;
};

export const formatMonthShort = (month: string): string => {
  if (!isPeriodMonth(month)) return month;
  const [y, m] = month.split('-').map(Number);
  const short = MONTHS_RU[m - 1].slice(0, 3);
  return `${short} ${y}`;
};

export const monthYear = (month: string): string =>
  isPeriodMonth(month) ? month.slice(0, 4) : '';
