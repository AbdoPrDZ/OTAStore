import React from 'react';
import { Text, TextProps } from 'react-native';

import { useTheme } from '@/theme';

type AppTextVariant =
  | 'hero'
  | 'screenTitle'
  | 'sectionTitle'
  | 'body'
  | 'secondary'
  | 'small'
  | 'button';

type AppTextColor =
  | 'text'
  | 'secondary'
  | 'error'
  | 'success'
  | 'warning'
  | 'info'
  | 'primary'
  | 'onPrimary'
  | 'disabled'
  | (string & {});

export type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  color?: AppTextColor;
  bold?: boolean;
};

const SIZE_KEYS: Record<
  AppTextVariant,
  'hero' | 'screenTitle' | 'sectionTitle' | 'body' | 'secondary' | 'small' | 'button'
> = {
  hero: 'hero',
  screenTitle: 'screenTitle',
  sectionTitle: 'sectionTitle',
  body: 'body',
  secondary: 'secondary',
  small: 'small',
  button: 'button',
};

const WEIGHTS: Record<
  AppTextVariant,
  'regular' | 'medium' | 'semibold' | 'bold'
> = {
  hero: 'bold',
  screenTitle: 'bold',
  sectionTitle: 'semibold',
  body: 'regular',
  secondary: 'regular',
  small: 'regular',
  button: 'semibold',
};

export default ({
  variant = 'body',
  color = 'text',
  bold,
  style,
  ...rest
}: AppTextProps) => {
  const { colors, fontSize, fontWeight } = useTheme();

  const textColorMap: Record<string, string> = {
    text: colors.text,
    secondary: colors.textSecondary,
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    primary: colors.primary,
    onPrimary: colors.textOnPrimary,
    disabled: colors.disabled,
  };

  const textColor = color in textColorMap ? textColorMap[color] : color;

  return (
    <Text
      style={[
        {
          color: textColor,
          fontSize: fontSize[SIZE_KEYS[variant]],
          fontWeight: bold ? fontWeight.bold : fontWeight[WEIGHTS[variant]],
        },
        style,
      ]}
      {...rest}
    />
  );
};
