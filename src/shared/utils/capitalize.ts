export const capitalizeFirst = (value: string): string =>
  value ? value[0].toUpperCase() + value.slice(1) : value;
