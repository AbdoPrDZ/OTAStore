import React from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppLogo from '@/components/AppLogo';
import TopBar from '@/components/TopBar';
import {
  AppBadge,
  AppButton,
  AppCard,
  AppDropdown,
  AppText,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useThemeMode } from '@/context/ThemeContext';
import {
  changeAppLanguage,
  isSupportedLanguage,
  LANGUAGES,
  type LanguageCode,
} from '@/i18n';
import { spacing, useTheme } from '@/theme';
import type { MainDrawerScreenProps } from '@/types/navigation';
import AppStorage from '@/utils/storage';

export default ({ navigation }: MainDrawerScreenProps<'Settings'>) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { mode, setMode } = useThemeMode();
  const { user, isAuthenticated, signOut } = useAuth();

  const currentLanguage = (
    i18n.resolvedLanguage ??
    i18n.language ??
    'en'
  ) as LanguageCode;

  const selectLanguage = (value: string) => {
    if (!isSupportedLanguage(value)) {
      return;
    }
    changeAppLanguage(value);
    AppStorage.setLanguage(value);
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TopBar title={t('settings.title')} />

      <ScrollView contentContainerStyle={styles.content}>
        <AppCard style={styles.card}>
          {isAuthenticated && user ? (
            <View style={styles.profileRow}>
              <AppLogo name={user.name || user.login} logoUrl={user.image_url} size={56} />
              <View style={styles.profileText}>
                <AppText variant="sectionTitle" numberOfLines={1}>
                  {user.name || user.login}
                </AppText>
                <AppText variant="secondary" color="secondary" numberOfLines={1}>
                  {user.login}
                </AppText>
                <View style={styles.roles}>
                  {user.roles.map(role => (
                    <AppBadge key={role} label={role} variant="primary" />
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.profileRow}>
              <AppLogo name="?" size={56} />
              <View style={styles.profileText}>
                <AppText variant="sectionTitle">{t('auth.guest')}</AppText>
                <AppText variant="secondary" color="secondary">
                  {t('store.privateSubtitle')}
                </AppText>
              </View>
            </View>
          )}

          {isAuthenticated ? (
            <AppButton
              variant="outline"
              title={t('auth.signOut')}
              icon="logout"
              onPress={signOut}
              style={styles.profileAction}
            />
          ) : (
            <AppButton
              title={t('auth.signIn')}
              icon="login"
              onPress={() => navigation.navigate('Login')}
              style={styles.profileAction}
            />
          )}
        </AppCard>

        <AppCard style={styles.card}>
          <AppText variant="sectionTitle" style={styles.sectionTitle}>
            {t('account.appearance')}
          </AppText>

          <View style={styles.settingRow}>
            <AppText variant="body">{t('account.theme')}</AppText>
            <Switch
              value={mode === 'dark'}
              onValueChange={value => setMode(value ? 'dark' : 'light')}
              trackColor={{ false: colors.disabled, true: colors.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={colors.disabled}
            />
          </View>

          <AppDropdown
            label={t('account.language')}
            placeholder={t('account.language')}
            items={LANGUAGES.map(item => ({
              value: item.value,
              label: item.label,
            }))}
            selectedValue={currentLanguage}
            onSelect={selectLanguage}
            icon="translate"
            style={styles.dropdown}
          />
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  card: {
    padding: spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileText: {
    flex: 1,
    gap: spacing.xs,
  },
  roles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  profileAction: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  dropdown: {
    marginBottom: 0,
  },
});
