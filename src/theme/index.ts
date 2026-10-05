import { useAuth } from '@/context/AuthContext';
import { useThemeMode } from '@/context/ThemeContext';

import type { ThemeColors } from './colors';
import { dark } from './dark';
import { light } from './light';
import { radius } from './radius';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { fontSize, fontWeight } from './typography';

export type { ThemeColors } from './colors';
export type { BadgeVariant } from './status';
export type { RadiusKey } from './radius';
export type { SpacingKey } from './spacing';
export { dark, fontSize, fontWeight, light, radius, shadows, spacing };

export type Theme = {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  shadows: typeof shadows;
  isDark: boolean;
};

export type ThemeMode = 'light' | 'dark';

export const useTheme = (): Theme => {
  const { mode } = useThemeMode();
  const { isTestMode } = useAuth();
  const isDark = mode === 'dark';

  // Test mode currently only changes the brand accent so testers can tell the
  // environments apart at a glance.
  const colors: ThemeColors = isDark
    ? { ...dark, ...(isTestMode ? { primary: '#F59E0B' } : {}) }
    : { ...light, ...(isTestMode ? { primary: '#B45309' } : {}) };

  return {
    colors,
    spacing,
    radius,
    fontSize,
    fontWeight,
    shadows,
    isDark,
  };
};

/** Plain colour lookup for non-hook contexts (e.g. navigation themes). */
export const palette = (mode: ThemeMode): ThemeColors => (mode === 'dark' ? dark : light);
