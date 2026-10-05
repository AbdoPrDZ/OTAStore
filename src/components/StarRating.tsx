import React from 'react';
import { StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@/theme';

export type StarRatingProps = {
  value: number;
  size?: number;
};

export default ({ value, size = 14 }: StarRatingProps) => {
  const { colors } = useTheme();
  const rounded = Math.round(value);

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= rounded;
        return (
          <MaterialCommunityIcons
            key={star}
            name={filled ? 'star' : 'star-outline'}
            size={size}
            color={filled ? colors.warning : colors.textSecondary}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
