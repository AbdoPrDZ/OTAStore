import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import AppLogo from './AppLogo';
import { AppText } from './ui';
import { useAuth } from '@/context/AuthContext';
import { spacing, useTheme } from '@/theme';

type IconProps = { color: string; size: number };

const SignInIcon = ({ color, size }: IconProps) => (
  <MaterialCommunityIcons name="login" size={size} color={color} />
);
const SignOutIcon = ({ color, size }: IconProps) => (
  <MaterialCommunityIcons name="logout" size={size} color={color} />
);

export default (props: DrawerContentComponentProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user, isAuthenticated, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const displayName =
    isAuthenticated && user ? user.name || user.login : t('auth.guest');
  const secondary =
    isAuthenticated && user ? user.login : t('drawer.signInHint');

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.md }]}
    >
      <Pressable
        accessibilityRole="button"
        onPress={() => props.navigation.navigate('Profile')}
        style={({ pressed }) => [styles.account, pressed && styles.pressed]}
      >
        <AppLogo
          name={user?.name || user?.login || '?'}
          logoUrl={user?.image_url}
          size={64}
          circular
        />
        <View style={styles.accountText}>
          <AppText variant="sectionTitle" numberOfLines={1}>
            {displayName}
          </AppText>
          <AppText
            variant="small"
            color="secondary"
            numberOfLines={1}
            style={styles.accountSecondary}
          >
            {secondary}
          </AppText>
        </View>
      </Pressable>

      <View style={styles.items}>
        <DrawerItemList {...props} />
      </View>

      <View style={styles.spacer} />

      <DrawerItem
        label={isAuthenticated ? t('auth.signOut') : t('auth.signIn')}
        labelStyle={{ color: colors.text }}
        icon={isAuthenticated ? SignOutIcon : SignInIcon}
        onPress={() => {
          props.navigation.closeDrawer();

          if (isAuthenticated) {
            signOut();
          } else {
            props.navigation.getParent()?.navigate('Login');
          }
        }}
      />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 0,
  },
  account: {
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.lg,
  },
  accountText: {
    alignItems: 'center',
    gap: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  accountSecondary: {
    textAlign: 'center',
  },
  items: {
    paddingTop: spacing.sm,
  },
  spacer: {
    flex: 1,
  },
});
