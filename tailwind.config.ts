import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  // Prefix Tailwind to avoid conflicts with Ant Design
  prefix: 'tw-',

  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],

  theme: {
    extend: {
      colors: {
        primary: '#1890ff',
        success: '#52c41a',
        warning: '#faad14',
        error: '#ff4d4f',
      },
    },
  },

  corePlugins: {
    // Disable Tailwind preflight to avoid conflicts with Ant Design
    preflight: false,
  },
}
