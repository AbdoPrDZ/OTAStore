import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';

import AppLogo from '@/components/AppLogo';
import TopBar from '@/components/TopBar';
import {
  AppBadge,
  AppButton,
  AppCard,
  AppInput,
  AppText,
  EmptyState,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { spacing, useTheme } from '@/theme';
import type { MainDrawerScreenProps } from '@/types/navigation';

export default ({ navigation }: MainDrawerScreenProps<'Profile'>) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, isAuthenticated, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [imageUri, setImageUri] = useState<string>();
  const [imageType, setImageType] = useState<string>();
  const [imageName, setImageName] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    setName(user?.name ?? '');
  }, [user?.name]);

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });

    if (result.didCancel || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];

    if (!asset.uri) {
      return;
    }

    setImageUri(asset.uri);
    setImageType(asset.type ?? 'image/jpeg');
    setImageName(asset.fileName ?? 'avatar.jpg');
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    setError(undefined);
    setSaved(false);

    const result = await updateProfile({
      name: name.trim() || undefined,
      imageUri,
      imageType,
      imageName,
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? t('profile.saveFailed'));
      return;
    }

    setImageUri(undefined);
    setSaved(true);
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TopBar title={t('profile.title')} />

      {!isAuthenticated || !user ? (
        <EmptyState
          icon="account-outline"
          title={t('profile.signInPrompt')}
          actionLabel={t('auth.signIn')}
          onAction={() => navigation.navigate('Login')}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <AppLogo
              name={user.name || user.login}
              logoUrl={imageUri ?? user.image_url}
              size={96}
              circular
            />
            <AppButton
              variant="outline"
              size="sm"
              title={t('profile.changePhoto')}
              icon="camera-outline"
              onPress={pickImage}
              style={styles.changePhoto}
            />
          </View>

          <AppCard style={styles.card}>
            <AppInput
              label={t('profile.name')}
              placeholder={t('profile.name')}
              value={name}
              onChangeText={text => {
                setName(text);
                setSaved(false);
              }}
            />

            <View style={styles.readonlyRow}>
              <AppText variant="secondary" color="secondary">
                {t('profile.login')}
              </AppText>
              <AppText variant="secondary" numberOfLines={1} style={styles.readonlyValue}>
                {user.login}
              </AppText>
            </View>

            {error ? (
              <AppText variant="secondary" color="error" style={styles.error}>
                {error}
              </AppText>
            ) : null}

            {saved ? (
              <AppText variant="secondary" color="success" style={styles.saved}>
                {t('profile.saved')}
              </AppText>
            ) : null}

            <AppButton
              title={t('profile.save')}
              icon="content-save-outline"
              loading={saving}
              onPress={save}
              style={styles.save}
            />
          </AppCard>

          <AppCard style={styles.card}>
            <AppText variant="sectionTitle" style={styles.sectionTitle}>
              {t('profile.roles')}
            </AppText>

            {user.roles.length === 0 ? (
              <AppText variant="secondary" color="secondary">
                {t('profile.noRoles')}
              </AppText>
            ) : (
              <View style={styles.badges}>
                {user.roles.map(role => (
                  <AppBadge key={role} label={role} variant="primary" />
                ))}
              </View>
            )}
          </AppCard>

          <AppCard style={styles.card}>
            <AppText variant="sectionTitle" style={styles.sectionTitle}>
              {t('profile.domains')}
            </AppText>

            {(user.domains ?? []).length === 0 ? (
              <AppText variant="secondary" color="secondary">
                {t('profile.noDomains')}
              </AppText>
            ) : (
              <View style={styles.badges}>
                {(user.domains ?? []).map(domain => (
                  <AppBadge key={domain.id} label={domain.name} icon="domain" />
                ))}
              </View>
            )}
          </AppCard>
        </ScrollView>
      )}
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
  hero: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  changePhoto: {
    paddingHorizontal: spacing.lg,
  },
  card: {
    padding: spacing.lg,
  },
  readonlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  readonlyValue: {
    flexShrink: 1,
  },
  error: {
    marginBottom: spacing.md,
  },
  saved: {
    marginBottom: spacing.md,
  },
  save: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
