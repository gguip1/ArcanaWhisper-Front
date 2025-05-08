import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['crystalball-svgrepo-com.svg', 'robots.txt', 'fonts/*.ttf', 'images/*.jpg'],
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
      workbox: {
        // 오프라인 모드에서 작동할 수 있도록 필요한 에셋 캐싱 전략 설정
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,ico,json}'],
        // 네트워크 요청이 실패할 때 오프라인 폴백 페이지 제공
        navigateFallback: '/offline.html',
        // API 요청에 대한 캐싱 전략
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.arcanawhisper\.com\/.*$/i, // 실제 API URL에 맞게 수정 필요
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24시간
              },
            },
          },
        ],
      },
    }),
  ],
})
