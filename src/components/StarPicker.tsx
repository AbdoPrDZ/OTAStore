import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@/theme';

export type StarPickerProps = {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  disabled?: boolean;
};

export default ({ value, onChange, size = 34, disabled }: StarPickerProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= value;
        return (
          <Pressable
            key={star}
            accessibilityRole="button"
            accessibilityLabel={`${star} star${star > 1 ? 's' : ''}`}
            accessibilityState={{ selected: filled, disabled }}
            disabled={disabled}
            hitSlop={6}
            onPress={() => onChange(star)}
            style={({ pressed }) => [styles.star, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons
              name={filled ? 'star' : 'star-outline'}
              size={size}
              color={filled ? colors.warning : colors.textSecondary}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    padding: 2,
  },
  pressed: {
    opacity: 0.6,
  },
});
