// lib/colors.ts - Type-safe color references
export const colors = {
  primary: {
    DEFAULT: '#2A6B52',
    dark: '#1F4A3A',
    light: '#E8F5F0',
  },
  gold: {
    DEFAULT: '#C4A647',
    dark: '#B3941A',
  },
  cream: {
    DEFAULT: '#FDF9F5',
    light: '#F5EDE4',
    dark: '#D4C4B5',
  },
  status: {
    success: '#16a34a',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#2563eb',
  },
} as const;

export type ColorKey = keyof typeof colors;
