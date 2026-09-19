const pluralize = (count: number, one: string, few: string, many: string): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${count} ${few}`;
  return `${count} ${many}`;
};

// Форматирует длительность ведения учёта по числу месяцев (первый месяц графика — сегодня).
// Формат зеркалит formatBudgetingBadge из ReportsList: «2 года 8 мес.».
export const formatCapitalDuration = (totalMonths: number): string | null => {
  if (!Number.isFinite(totalMonths)) return null;
  const total = Math.floor(totalMonths);
  if (total <= 0) return null;

  const years = Math.floor(total / 12);
  const months = total % 12;

  const parts: string[] = [];
  if (years > 0) {
    parts.push(pluralize(years, 'год', 'года', 'лет'));
  }
  if (months > 0) {
    parts.push(`${months} мес.`);
  }
  return parts.join(' ');
};
