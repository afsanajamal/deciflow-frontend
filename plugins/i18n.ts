import { createI18n } from 'vue-i18n'
import en from '~/i18n/locales/en.json'
import ja from '~/i18n/locales/ja.json'

export default defineNuxtPlugin(({ vueApp }) => {
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
      en,
      ja,
    },
  })

  vueApp.use(i18n)
})
