import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { spacing, useTheme } from '@/theme';
import AppText from './AppText';

export type LoadingStateProps = {
  label?: string;
};

export default ({ label }: LoadingStateProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const resolvedLabel = label ?? t('common.loading');

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {resolvedLabel ? (
        <AppText variant="secondary" color="secondary" style={styles.label}>
          {resolvedLabel}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  label: {
    marginTop: spacing.md,
  },
});
