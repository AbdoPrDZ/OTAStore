import React from 'react';
import { StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme, type BadgeVariant } from '@/theme';
import AppText from './AppText';

export type AppBadgeProps = {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

export default ({ label, variant = 'neutral', icon }: AppBadgeProps) => {
  const { colors, radius, spacing } = useTheme();

  const textColor = {
    neutral: colors.textSecondary,
    primary: colors.textOnPrimary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    danger: colors.danger,
  }[variant];

  const backgroundColor = {
    neutral: colors.disabledBackground,
    primary: colors.primary,
    success: colors.successBackground,
    warning: colors.warningBackground,
    error: colors.errorBackground,
    info: colors.infoBackground,
    danger: colors.dangerBackground,
  }[variant];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
        },
      ]}
    >
      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={12}
          color={textColor}
          style={styles.icon}
        />
      ) : null}
      <AppText variant="small" color={textColor}>
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
});
