import type { ThemeColors } from './colors';

export type BadgeVariant =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'danger';

export type Tone = {
  text: keyof ThemeColors;
  background: keyof ThemeColors;
};

export const toneByStatus: Record<BadgeVariant, Tone> = {
  neutral: { text: 'textSecondary', background: 'disabledBackground' },
  primary: { text: 'textOnPrimary', background: 'primary' },
  success: { text: 'success', background: 'successBackground' },
  warning: { text: 'warning', background: 'warningBackground' },
  error: { text: 'error', background: 'errorBackground' },
  info: { text: 'info', background: 'infoBackground' },
  danger: { text: 'danger', background: 'dangerBackground' },
};
