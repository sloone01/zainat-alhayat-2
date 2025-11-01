import { createI18n } from 'vue-i18n'

// Import translation files
import en from './locales/en.json'
import ar from './locales/ar.json'

const messages = {
  en,
  ar
}

// Get saved language or default to English
const savedLanguage = localStorage.getItem('language') || 'en'

const i18n = createI18n({
  legacy: false,
  locale: savedLanguage,
  fallbackLocale: 'en',
  messages
})

export default i18n

