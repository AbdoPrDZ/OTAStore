import AsyncStorage from '@react-native-async-storage/async-storage';

import type { LanguageCode } from '@/i18n';
import type { ThemeMode } from '@/theme';

const AUTH_TOKEN_KEY = 'auth_token';
const APP_THEME_KEY = 'app_theme';
const APP_LANGUAGE_KEY = 'app_language';
const IS_TEST_MODE_KEY = 'is_test_mode';

export default class AppStorage {
  static getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem(AUTH_TOKEN_KEY);
  }

  static setAuthToken(token: string): Promise<void> {
    return AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  static clearAuthToken(): Promise<void> {
    return AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  }

  static getTheme(): Promise<ThemeMode | null> {
    return AsyncStorage.getItem(APP_THEME_KEY) as Promise<ThemeMode | null>;
  }

  static setTheme(theme: ThemeMode): Promise<void> {
    return AsyncStorage.setItem(APP_THEME_KEY, theme);
  }

  static getLanguage(): Promise<string | null> {
    return AsyncStorage.getItem(APP_LANGUAGE_KEY);
  }

  static setLanguage(language: LanguageCode): Promise<void> {
    return AsyncStorage.setItem(APP_LANGUAGE_KEY, language);
  }

  static getIsTestMode(): Promise<boolean> {
    return AsyncStorage.getItem(IS_TEST_MODE_KEY).then(value => value === 'true');
  }

  static setIsTestMode(isTest: boolean): Promise<void> {
    return AsyncStorage.setItem(IS_TEST_MODE_KEY, String(isTest));
  }

  static clearIsTestMode(): Promise<void> {
    return AsyncStorage.removeItem(IS_TEST_MODE_KEY);
  }
}
