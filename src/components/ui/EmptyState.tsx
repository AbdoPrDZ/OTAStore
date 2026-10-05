import React from 'react';
import { StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { spacing, useTheme } from '@/theme';
import AppButton from './AppButton';
import AppText from './AppText';

export type EmptyStateProps = {
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default ({
  icon = 'package-variant',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={icon}
        size={48}
        color={colors.textSecondary}
        style={styles.icon}
      />
      <AppText variant="sectionTitle" style={styles.title}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="secondary" color="secondary" style={styles.description}>
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <AppButton
          title={actionLabel}
          variant="outline"
          onPress={onAction}
          style={styles.action}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  icon: {
    marginBottom: spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  action: {
    marginTop: spacing.xl,
    minWidth: 200,
  },
});
