export const COLOR_PALETTE: string[] = [
  '#F2756E',
  '#7CCFA0',
  '#B77DE0',
  '#F5D74A',
  '#6FC4EE',
  '#EE7AB5',
  '#9AD97B',
  '#7F97D4',
  '#F5A65C',
  '#7ED0BC',
  '#C89BE0',
  '#CBE072',
];

export const COLOR_PALETTE_BG_ALPHA = 0.15;

export function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((character) => character + character)
          .join('')
      : normalized;
  const value = parseInt(full, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export const COLOR_PALETTE_TRANSPARENT: string[] = COLOR_PALETTE.map((color) =>
  withAlpha(color, COLOR_PALETTE_BG_ALPHA),
);
