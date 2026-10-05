import React from 'react';
import { Pressable, StyleSheet, View, ViewProps } from 'react-native';

import { useTheme } from '@/theme';

export type AppCardProps = ViewProps & {
  onPress?: () => void;
};

export default ({ onPress, style, children, ...rest }: AppCardProps) => {
  const { colors, spacing, radius } = useTheme();

  const cardStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.lg,
  };

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
          style,
        ]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[cardStyle, style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.9,
  },
});
