import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DevSettings, I18nManager } from 'react-native';
import { getLocales } from 'react-native-localize';

import ar from './locales/ar';
import en from './locales/en';
import fr from './locales/fr';

const RESOURCES = {
  en: { translation: en },
  fr: { translation: fr },
  ar: { translation: ar },
};

export type LanguageCode = keyof typeof RESOURCES;

export const LANGUAGES: { value: LanguageCode; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'العربية' },
];

type NestedKeys<T> = {
  [K in keyof T]: T[K] extends object
    ? `${K & string}.${NestedKeys<T[K]>}`
    : K & string;
}[keyof T];

export type TranslationKey = NestedKeys<typeof en>;

export const isRTLLanguage = (lng: LanguageCode): boolean => lng === 'ar';

export const isSupportedLanguage = (
  lng: string | undefined,
): lng is LanguageCode => !!lng && lng in RESOURCES;

I18nManager.allowRTL(true);

const deviceLanguage = getLocales()[0]?.languageCode?.toLowerCase();

i18n.use(initReactI18next).init({
  resources: RESOURCES,
  lng: isSupportedLanguage(deviceLanguage) ? deviceLanguage : 'en',
  fallbackLng: 'en',
  supportedLngs: ['en', 'fr', 'ar'],
  interpolation: { escapeValue: false },
  initAsync: false,
  react: { useSuspense: false },
});

I18nManager.forceRTL(isRTLLanguage(i18n.language as LanguageCode));

export const applyLanguage = (lng: LanguageCode): void => {
  if (!isSupportedLanguage(lng)) {
    return;
  }
  i18n.changeLanguage(lng);
  I18nManager.forceRTL(isRTLLanguage(lng));
};

export const changeAppLanguage = (lng: LanguageCode): void => {
  const needsReload = I18nManager.isRTL !== isRTLLanguage(lng);
  applyLanguage(lng);
  if (needsReload && __DEV__) {
    requestAnimationFrame(() => DevSettings.reload());
  }
};

export default i18n;
