import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192x192.svg', 'pwa-512x512.svg'],
      manifest: {
        name: 'ASTA Family Time - Game Kartu Keluarga ASTA',
        short_name: 'ASTA Family',
        description: 'Permainan kartu keluarga interaktif, seru, lucu, dan edukatif untuk dimainkan bersama keluarga di rumah.',
        theme_color: '#FF6B6B',
        background_color: '#FFF9EB',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/ASTA-Family-Time/',
        start_url: '/ASTA-Family-Time/',
        icons: [
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}']
      }
    })
  ],
  base: '/ASTA-Family-Time/',
})
