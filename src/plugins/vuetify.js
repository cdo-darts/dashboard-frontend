/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const storedTheme = typeof window === 'undefined' ? null : localStorage.getItem('vertex-theme')

export default createVuetify({
  theme: {
    defaultTheme: storedTheme === 'light' ? 'light' : 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          'background': '#0f1115',
          'surface': '#10141c',
          'surface-bright': '#1e293b',
          'surface-light': '#1a1f2e',
          'surface-variant': '#1e293b',
          'on-surface-variant': '#cbd5e1',
          'primary': '#2f78ff',
          'secondary': '#64748b',
          'error': '#f24628',
          'info': '#2f78ff',
          'success': '#25b269',
          'warning': '#f59e0b',
        },
      },
      light: {
        dark: false,
        colors: {
          'background': '#f3f6fc',
          'surface': '#ffffff',
          'surface-bright': '#f8fafc',
          'surface-light': '#eef2ff',
          'surface-variant': '#e2e8f0',
          'on-surface-variant': '#334155',
          'primary': '#255fd6',
          'secondary': '#64748b',
          'error': '#dc2626',
          'info': '#2563eb',
          'success': '#16a34a',
          'warning': '#d97706',
        },
      },
    },
  },
})
