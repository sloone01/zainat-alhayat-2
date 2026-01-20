import { createI18n } from 'vue-i18n'

// Import translation files
import en from './locales/en.json'
import ar from './locales/ar.json'

const messages = {
  en,
  ar
}

// Get saved language or default to Arabic
const savedLanguage = localStorage.getItem('language') || 'ar'

const i18n = createI18n({
  legacy: false,
  locale: savedLanguage,
  fallbackLocale: 'ar',
  messages
})

export default i18n

