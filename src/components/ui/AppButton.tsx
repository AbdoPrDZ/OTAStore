import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@/theme';
import AppText from './AppText';

type AppButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success';

type AppButtonSize = 'sm' | 'md' | 'lg';

export type AppButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title?: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  style?: StyleProp<ViewStyle>;
};

export default ({
  title,
  variant = 'primary',
  size = 'lg',
  loading = false,
  icon,
  disabled,
  style,
  ...rest
}: AppButtonProps) => {
  const { colors, spacing, radius, fontSize, fontWeight } = useTheme();

  const isDisabled = disabled || loading;

  const background = {
    primary: colors.primary,
    secondary: colors.surfaceMuted,
    outline: 'transparent',
    ghost: 'transparent',
    danger: colors.error,
    success: colors.success,
  }[variant];

  const borderColor = {
    primary: colors.primary,
    secondary: colors.border,
    outline: colors.primary,
    ghost: 'transparent',
    danger: colors.error,
    success: colors.success,
  }[variant];

  const tint = {
    primary: colors.textOnPrimary,
    secondary: colors.text,
    outline: colors.primary,
    ghost: colors.primary,
    danger: colors.textOnPrimary,
    success: '#052E16',
  }[variant];

  const textColor = {
    primary: 'onPrimary',
    secondary: 'text',
    outline: 'primary',
    ghost: 'primary',
    danger: 'onPrimary',
    success: 'onPrimary',
  }[variant] as 'onPrimary' | 'text' | 'primary';

  const horizontalPadding =
    size === 'sm' ? spacing.md : size === 'lg' ? spacing.xl : spacing.lg;

  const verticalPadding =
    size === 'sm' ? spacing.sm : size === 'lg' ? spacing.lg : spacing.md;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isDisabled ? colors.disabledBackground : background,
          borderColor: isDisabled ? colors.disabledBackground : borderColor,
          borderWidth:
            variant === 'outline' || variant === 'secondary' ? 1 : 0,
          borderRadius: radius.button,
          paddingVertical: verticalPadding,
          paddingHorizontal: horizontalPadding,
          opacity: pressed ? 0.85 : 1,
          minHeight: size === 'sm' ? 40 : 48,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={tint} />
      ) : (
        <View style={styles.row}>
          {icon ? (
            <MaterialCommunityIcons
              name={icon}
              size={fontSize.body}
              color={tint}
              style={styles.icon}
            />
          ) : null}
          {title ? (
            <AppText
              variant="button"
              color={textColor}
              style={{ fontWeight: fontWeight.semibold }}
            >
              {title}
            </AppText>
          ) : null}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
});
