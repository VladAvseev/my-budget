export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3
    ? normalized
        .split('')
        .map((char) => char + char)
        .join('')
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return hex;
  }

  const intValue = parseInt(full, 16);
  const red = (intValue >> 16) & 255;
  const green = (intValue >> 8) & 255;
  const blue = intValue & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
