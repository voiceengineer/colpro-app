// src/theme.ts

const palette = {
  blue: '#3b82f6',
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748b',
  slate400: '#94a3b8',
  white: '#ffffff',
  green: '#10b981',
  red: '#ef4444',
  amber: '#f59e0b',
  violet: '#8b5cf6',
  cyan: '#06b6d4',
  lime: '#84cc16',
};

export const theme = {
  colors: {
    background: palette.slate900,
    card: palette.slate800,
    border: palette.slate700,
    
    text: palette.white,
    textSecondary: palette.slate400,
    textMuted: palette.slate500,

    primary: palette.blue,
    primaryContrast: palette.white,
    
    success: palette.green,
    danger: palette.red,
    warning: palette.amber,
    info: palette.cyan,
    
    icon: palette.slate400,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  font: {
    size: {
      xs: 11,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 24,
      xxxl: 28,
    },
    weight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },
};
