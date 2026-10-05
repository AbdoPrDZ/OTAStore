import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { spacing, useTheme } from '@/theme';
import { AppText } from '@/components/ui';
import AppLogo from '@/components/BrandLogo';

export default () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppLogo size={168} />
      <AppText variant="hero" style={styles.title}>
        OTAStore
      </AppText>
      <ActivityIndicator color={colors.primary} style={styles.spinner} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.lg,
  },
  spinner: {
    marginTop: spacing.xl,
  },
});
