import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme as NavTheme,
} from '@react-navigation/native';
import { OTAProvider } from 'ota-client';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/context/AuthContext';
import { ConfigProvider } from '@/context/ConfigContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { applyLanguage, isSupportedLanguage } from '@/i18n';
import Navigator from '@/Navigator';
import { useTheme, type ThemeMode } from '@/theme';
import AppStorage from '@/utils/storage';

function NavigationRoot() {
  const { colors, isDark } = useTheme();

  const navTheme = useMemo<NavTheme>(() => {
    const base = isDark ? DarkTheme : DefaultTheme;

    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.error,
      },
    };
  }, [isDark, colors]);

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer theme={navTheme}>
        <Navigator />
      </NavigationContainer>
    </>
  );
}

function OtaRoot() {
  const { t } = useTranslation();

  return (
    <OTAProvider
      autoCheck
      bootFallback={null}
      unconfiguredFallback={null}
      onError={error => console.log(`[OTA] error: ${error.message}`)}
      onUnreachable={() => console.log('[OTA] server unreachable')}
      onStatusChange={status => console.log(`[OTA] status: ${status}`)}
      updateOverlayProps={{
        copy: {
          updateTitle: t('ota.updateTitle'),
          updateMessage: t('ota.updateMessage'),
          appUpdateMessage: t('ota.appUpdateMessage'),
          installLabel: t('ota.installLabel'),
          laterLabel: t('ota.laterLabel'),
          downloadVersionLabel: t('ota.downloadVersionLabel'),
          downloadingLabel: t('ota.downloadingLabel'),
          restartingLabel: t('ota.restartingLabel'),
          retryLabel: t('ota.retryLabel'),
          unknownSizeLabel: t('ota.unknownSizeLabel'),
          requiredTitle: t('ota.requiredTitle'),
          requiredMessage: t('ota.requiredMessage'),
        },
      }}
    >
      <NavigationRoot />
    </OTAProvider>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    let active = true;

    Promise.all([AppStorage.getTheme(), AppStorage.getLanguage()])
      .then(([theme, language]) => {
        if (!active) {
          return;
        }

        if (theme) {
          setThemeMode(theme);
        }

        if (language && isSupportedLanguage(language)) {
          applyLanguage(language);
        }
      })
      .finally(() => {
        if (active) {
          setReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider
          initialMode={themeMode}
          onChangeMode={mode => {
            AppStorage.setTheme(mode);
          }}
        >
          <AuthProvider>
            <ConfigProvider>
              <OtaRoot />
            </ConfigProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
