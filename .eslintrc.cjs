module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    'prettier',
  ],
  plugins: ['vue'],
  globals: {
    // Nuxt auto-imports
    defineNuxtConfig: 'readonly',
    defineNuxtPlugin: 'readonly',
    navigateTo: 'readonly',
    useRoute: 'readonly',
    useRouter: 'readonly',
    useRuntimeConfig: 'readonly',
    useState: 'readonly',
    useFetch: 'readonly',
    useAsyncData: 'readonly',
    useNuxtApp: 'readonly',
    useAuthStore: 'readonly',
    // Vue auto-imports
    ref: 'readonly',
    computed: 'readonly',
    reactive: 'readonly',
    watch: 'readonly',
    onMounted: 'readonly',
    onUnmounted: 'readonly',
    nextTick: 'readonly',
    // Vitest globals
    describe: 'readonly',
    it: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    vi: 'readonly',
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/require-default-prop': 'off',
    'no-unused-vars': 'off', // TypeScript handles this
    'no-undef': 'off', // TypeScript handles this
    'vue/no-expose-after-await': 'off',
    'vue/attributes-order': 'warn',
  },
}
