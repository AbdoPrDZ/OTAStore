import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { spacing, useTheme } from '@/theme';

export type IconButtonTone = 'neutral' | 'primary' | 'danger' | 'success';

export type IconButtonProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  tone?: IconButtonTone;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default ({
  icon,
  label,
  tone = 'neutral',
  loading,
  disabled,
  onPress,
  style,
}: IconButtonProps) => {
  const { colors, radius } = useTheme();

  const background = {
    neutral: colors.surfaceMuted,
    primary: colors.primary,
    danger: colors.error,
    success: colors.success,
  }[tone];

  const tint = {
    neutral: colors.text,
    primary: colors.textOnPrimary,
    danger: colors.textOnPrimary,
    success: colors.textOnPrimary,
  }[tone];

  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive }}
      disabled={inactive}
      hitSlop={spacing.sm}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: background,
          borderColor: colors.border,
          borderRadius: radius.button,
          opacity: inactive ? 0.5 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tint} />
      ) : (
        <MaterialCommunityIcons name={icon} size={22} color={tint} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
