// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Compatibility and future flags
  compatibilityDate: '2024-04-03',

  // Dev tools
  devtools: { enabled: true },

  // SSR mode - false for SPA (easier deployment)
  ssr: false,

  // Runtime config
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api',
    },
  },

  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  // CSS
  css: [
    '~/assets/styles/main.css',
  ],

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: true,
  },

  // App configuration
  app: {
    head: {
      title: 'DeciFlow - Purchase Request Management',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Purchase request and approval workflow management system' },
      ],
    },
  },

  // Dev server
  devServer: {
    port: 3000,
  },
})
