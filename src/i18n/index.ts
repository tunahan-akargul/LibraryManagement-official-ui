import { createI18n } from 'vue-i18n'
import tr from './locales/tr'
import en from './locales/en'

const savedLocale = localStorage.getItem('locale') || 'tr'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    tr,
    en,
  },
})

export default i18n
