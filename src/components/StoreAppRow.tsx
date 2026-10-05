import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import type { StoreApp } from '@/api/types';
import { spacing, useTheme } from '@/theme';

import AppLogo from './AppLogo';
import StarRating from './StarRating';
import { AppBadge, AppText } from './ui';

export type StoreAppRowProps = {
  app: StoreApp;
  onPress: () => void;
  action?: React.ReactNode;
  chevron?: boolean;
};

export default ({ app, onPress, action, chevron = true }: StoreAppRowProps) => {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          borderColor: colors.border,
          backgroundColor: pressed ? colors.surfaceMuted : 'transparent',
        },
      ]}
    >
      <AppLogo name={app.name} logoUrl={app.logo_url} size={52} />

      <View style={styles.text}>
        <AppText variant="body" bold numberOfLines={1}>
          {app.name}
        </AppText>
        {app.summary ? (
          <AppText
            variant="small"
            color="secondary"
            numberOfLines={1}
            style={styles.summary}
          >
            {app.summary}
          </AppText>
        ) : null}
        {app.rating_count > 0 && app.rating_avg != null ? (
          <View style={styles.rating}>
            <StarRating value={app.rating_avg} size={12} />
            <AppText variant="small" color="secondary">
              {app.rating_avg.toFixed(1)} ({app.rating_count})
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.trailing}>
        {app.version ? <AppBadge label={app.version} /> : null}
        {action ??
          (chevron ? (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={colors.textSecondary}
            />
          ) : null)}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  summary: {
    marginTop: 2,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
