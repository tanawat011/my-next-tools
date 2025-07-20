import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

// Import translations
import { en } from './locales/en'
import { th } from './locales/th'

const resources = {
  en: {
    translation: en,
  },
  th: {
    translation: th,
  },
}

// Configure i18n but don't initialize it immediately
i18n.use(LanguageDetector).use(initReactI18next)

export const i18nConfig = {
  resources,
  fallbackLng: 'en',
  debug: process.env.NODE_ENV === 'development',
  interpolation: {
    escapeValue: false,
  },
  detection: {
    order: ['cookie', 'localStorage', 'navigator'],
    caches: ['cookie', 'localStorage'],
    cookieMinutes: 525600, // 1 year
    cookieDomain: undefined,
    cookieOptions: {
      path: '/',
      sameSite: 'lax' as const,
    },
  },
}

// Initialize with default config
i18n.init(i18nConfig)

export default i18n
