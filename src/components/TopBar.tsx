import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { MainDrawerParamList } from '@/types/navigation';
import { spacing, useTheme } from '@/theme';
import { AppText } from './ui';

export type TopBarProps = {
  title: string;
  right?: React.ReactNode;
};

export default ({ title, right }: TopBarProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation =
    useNavigation<DrawerNavigationProp<MainDrawerParamList>>();

  return (
    <View style={[styles.bar, { borderColor: colors.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('ui.menuA11y')}
        hitSlop={spacing.sm}
        onPress={() => navigation.openDrawer()}
        style={({ pressed }) => [styles.menu, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons name="menu" size={26} color={colors.text} />
      </Pressable>

      <AppText variant="screenTitle" numberOfLines={1} style={styles.title}>
        {title}
      </AppText>

      {right ?? null}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menu: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  title: {
    flex: 1,
  },
  pressed: {
    opacity: 0.6,
  },
});
