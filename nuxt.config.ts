export default defineNuxtConfig({
  publicDir: 'public/',
  modules: ['@nuxt/ui', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css', '~/assets/css/home.css'],
  devtools: { enabled: true },
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },
  runtimeConfig: {
    public: {
      siteUrl: '',
      supabaseUrl: '',
      supabaseAnonKey: ''
    }
  },
  app: {
    head: {
      meta: [
        { name: 'theme-color', content: '#f7f4ec' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/icons/favicon.png' },
        { rel: 'apple-touch-icon', href: '/icons/favicon.png' }
      ]
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'AUsyon Hub',
      short_name: 'AUsyon',
      description: 'A little corner for alternate universe stories.',
      theme_color: '#f7f4ec',
      background_color: '#f7f4ec',
      display: 'standalone',
      start_url: '/',
      icons: [
        { src: '/icons/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,woff2}']
    },
    devOptions: {
      enabled: false
    }
  },
  ui: {
    theme: {
      colors: ['primary', 'secondary', 'success', 'info', 'warning', 'error']
    }
  },
  compatibilityDate: '2025-03-01'
})
