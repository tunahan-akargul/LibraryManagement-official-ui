import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { tr } from 'vuetify/locale'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  locale: {
    locale: 'tr',
    messages: { tr },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#3b82f6',
          secondary: '#1e293b',
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626',
          info: '#3b82f6',
          background: '#f1f5f9',
          surface: '#ffffff',
        },
      },
    },
  },
  defaults: {
    VCard: { rounded: 'lg', elevation: 1 },
    VChip: { size: 'small', label: true },
    VTable: { density: 'comfortable' },
    VBtn: { rounded: 'lg' },
  },
})

export default vuetify