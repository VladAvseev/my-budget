export const typography = {
  fontFamily: "'Roboto', -apple-system, 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
  fontSize: {
    s: '12px',
    m: '14px',
    l: '16px',
    xl: '20px',
    xxl: '24px',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
  },
} as const;

export const spacing = {
  xs: '4px',
  s: '8px',
  m: '12px',
  l: '16px',
  xl: '24px',
  xxl: '32px',
} as const;

export const radius = {
  s: '4px',
  m: '8px',
  l: '12px',
  round: '50%',
} as const;

export const shadow = {
  s: '0 1px 3px rgba(0,0,0,0.12)',
  m: '0 4px 6px rgba(0,0,0,0.15)',
  l: '0 10px 20px rgba(0,0,0,0.2)',
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;
