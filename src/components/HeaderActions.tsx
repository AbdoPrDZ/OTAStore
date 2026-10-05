import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { AppModal, AppText, IconButton } from '@/components/ui';
import { useThemeMode } from '@/context/ThemeContext';
import {
  changeAppLanguage,
  isSupportedLanguage,
  LANGUAGES,
  type LanguageCode,
} from '@/i18n';
import { spacing, useTheme } from '@/theme';
import AppStorage from '@/utils/storage';

export default () => {
  const { mode, setMode } = useThemeMode();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const nextMode = mode === 'light' ? 'dark' : 'light';
  const current = (i18n.resolvedLanguage ?? i18n.language ?? 'en') as LanguageCode;

  const selectLanguage = (value: string) => {
    if (!isSupportedLanguage(value)) {
      return;
    }
    changeAppLanguage(value);
    AppStorage.setLanguage(value);
    setOpen(false);
  };

  return (
    <View style={styles.row}>
      <IconButton
        icon={nextMode === 'dark' ? 'weather-night' : 'weather-sunny'}
        label={
          nextMode === 'dark'
            ? t('account.themeDark')
            : t('account.themeLight')
        }
        tone="neutral"
        onPress={() => setMode(nextMode)}
      />
      <IconButton
        icon="translate"
        label={t('account.language')}
        tone="neutral"
        onPress={() => setOpen(true)}
      />

      <AppModal
        visible={open}
        title={t('account.language')}
        onClose={() => setOpen(false)}
      >
        {LANGUAGES.map(item => {
          const active = item.value === current;
          return (
            <Pressable
              key={item.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => selectLanguage(item.value)}
              style={[styles.option, { borderColor: colors.border }]}
            >
              <AppText
                variant="body"
                color={active ? 'primary' : 'text'}
                bold={active}
                style={styles.optionLabel}
              >
                {item.label}
              </AppText>
              {active ? (
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color={colors.primary}
                />
              ) : null}
            </Pressable>
          );
        })}
      </AppModal>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
  },
  optionLabel: {
    flex: 1,
  },
});
