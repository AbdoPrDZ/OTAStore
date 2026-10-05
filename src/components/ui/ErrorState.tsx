import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { spacing, useTheme } from '@/theme';
import AppButton from './AppButton';
import AppText from './AppText';

export type ErrorStateProps = {
  title?: string;
  message?: string;
  actionLabel?: string;
  onRetry?: () => void;
};

export default ({ title, message, actionLabel, onRetry }: ErrorStateProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={48}
        color={colors.error}
        style={styles.icon}
      />
      <AppText variant="sectionTitle" style={styles.title}>
        {title ?? t('ui.errorDefaultTitle')}
      </AppText>
      <AppText variant="secondary" color="secondary" style={styles.message}>
        {message ?? t('ui.errorDefaultMessage')}
      </AppText>
      {onRetry ? (
        <AppButton
          title={actionLabel ?? t('common.retry')}
          variant="outline"
          onPress={onRetry}
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
  message: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  action: {
    marginTop: spacing.xl,
    minWidth: 200,
  },
});
