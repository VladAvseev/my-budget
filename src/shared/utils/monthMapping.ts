export const MONTHS_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
] as const;

export const MONTHS_EN = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
] as const;

export const MIN_YEAR = 2000;
export const MAX_YEAR = 2099;

export const buildCode = (month: number, year: number): string =>
  `${MONTHS_EN[month]}_${year}`;

export const buildName = (month: number, year: number): string =>
  `${MONTHS_RU[month]} ${year}`;

const toISODateLocal = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const buildPeriodDates = (
  month: number,
  year: number,
): { periodStart: string; periodEnd: string } => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    periodStart: toISODateLocal(start),
    periodEnd: toISODateLocal(end),
  };
};

export interface MonthOption {
  month: number;
  year: number;
  label: string;
  code: string;
}

export const buildMonthOptions = (): MonthOption[] => {
  const options: MonthOption[] = [];
  for (let year = MIN_YEAR; year <= MAX_YEAR; year++) {
    for (let month = 0; month < 12; month++) {
      options.push({
        month,
        year,
        label: buildName(month, year),
        code: buildCode(month, year),
      });
    }
  }
  return options;
};

export const formatPeriodDisplay = (periodStart: string, periodEnd: string): string => {
  const formatDate = (iso: string) => {
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
  };
  return `${formatDate(periodStart)} – ${formatDate(periodEnd)}`;
};
