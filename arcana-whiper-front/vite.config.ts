import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // 'prompt'로 변경해서 사용자에게 설치 여부를 물어봅니다.
      includeAssets: ['crystalball-svgrepo-com.svg', 'fonts/*.ttf', 'images/*.jpg'],
      manifest: {
        name: 'Arcana Whisper',
        short_name: 'ArcanaWhisper',
        description: 'AI 기반 타로 리딩 서비스',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone',
        icons: [
          {
            src: '/crystalball-svgrepo-com.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/crystalball-svgrepo-com.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      },
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,ico,json}'],
        navigateFallback: '/offline.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.arcanawhisper\.com\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24
              }
            }
          }
        ]
      }
    })
  ],
})
