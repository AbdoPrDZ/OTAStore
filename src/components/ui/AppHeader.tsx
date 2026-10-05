import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { spacing, useTheme } from '@/theme';
import AppText from './AppText';

export type AppHeaderProps = {
  title: string;
  subtitle?: string;
  leftActionNode?: React.ReactNode;
  onBack?: () => void;
  onMenu?: () => void;
  right?: React.ReactNode;
};

export default ({
  title,
  subtitle,
  leftActionNode,
  onBack,
  onMenu,
  right,
}: AppHeaderProps) => {
  const { colors, spacing: gaps } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.lg }]}>
      {leftActionNode ? (
        <View style={[styles.action, { marginRight: gaps.sm }]}>{leftActionNode}</View>
      ) : onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('ui.backA11y')}
          hitSlop={gaps.sm}
          onPress={onBack}
          style={({ pressed }) => [
            styles.action,
            { marginRight: gaps.sm },
            pressed && styles.pressed,
          ]}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </Pressable>
      ) : onMenu ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('ui.menuA11y')}
          hitSlop={gaps.sm}
          onPress={onMenu}
          style={({ pressed }) => [
            styles.action,
            { marginRight: gaps.sm },
            pressed && styles.pressed,
          ]}
        >
          <MaterialCommunityIcons name="menu" size={24} color={colors.text} />
        </Pressable>
      ) : null}

      <View style={styles.titles}>
        <AppText variant="screenTitle" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="secondary" color="secondary" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  titles: {
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
