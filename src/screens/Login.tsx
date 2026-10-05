import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppLogo from '@/components/BrandLogo';
import HeaderActions from '@/components/HeaderActions';
import { AppButton, AppCard, AppInput, AppText } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { spacing, useTheme } from '@/theme';
import type { RootStackScreenProps } from '@/types/navigation';

export default ({ navigation }: RootStackScreenProps<'Login'>) => {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const { colors } = useTheme();

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async () => {
    if (!login.trim() || !password) {
      setError(t('auth.validationError'));
      return;
    }

    setLoading(true);
    setError(undefined);

    const result = await signIn(login.trim(), password, false);

    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? t('auth.signInFailed'));
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.topBar}>
        <HeaderActions />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View style={styles.logoWrap}>
            <AppLogo size={128} />
            <AppText variant="hero" style={styles.brand}>
              OTAStore
            </AppText>
          </View>

          <AppCard style={styles.card}>
            <AppText variant="screenTitle" style={styles.title}>
              {t('auth.loginTitle')}
            </AppText>
            <AppText variant="secondary" color="secondary" style={styles.subtitle}>
              {t('auth.loginSubtitle')}
            </AppText>

            <AppInput
              label={t('auth.username')}
              placeholder={t('auth.username')}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              value={login}
              onChangeText={setLogin}
              returnKeyType="next"
            />

            <AppInput
              label={t('auth.password')}
              placeholder={t('auth.password')}
              secureTextEntry
              editable={!loading}
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={loading ? undefined : submit}
            />

            {error ? (
              <AppText variant="secondary" color="error" style={styles.error}>
                {error}
              </AppText>
            ) : null}

            <AppButton
              title={t('auth.signIn')}
              loading={loading}
              onPress={submit}
            />
          </AppCard>

          <AppButton
            variant="ghost"
            title={t('common.cancel')}
            onPress={() => navigation.goBack()}
            style={styles.cancel}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  brand: {
    marginTop: spacing.md,
  },
  card: {
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  error: {
    marginBottom: spacing.md,
  },
  cancel: {
    marginTop: spacing.lg,
  },
});
