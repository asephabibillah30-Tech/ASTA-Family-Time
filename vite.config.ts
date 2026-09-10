import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const isVercel = Boolean(process.env.VERCEL);
const basePath = isVercel ? '/' : '/ASTA-Family-Time/';

// https://vite.dev/config/
export default defineConfig({
  envPrefix: ['VITE_', 'SUPABASE_', 'NEXT_PUBLIC_'],
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192x192.svg', 'pwa-512x512.svg'],
      manifest: {
        name: 'ASTA Family Time - Satu aplikasi, lebih banyak waktu bersama keluarga.',
        short_name: 'ASTA Family',
        description: 'ASTA - Aktivitas • Senyum • Tawa • Apresiasi - “Satu aplikasi, lebih banyak waktu bersama Keluarga.” ❤️',
        theme_color: '#FF6B6B',
        background_color: '#FFF9EB',
        display: 'standalone',
        orientation: 'portrait',
        scope: basePath,
        start_url: basePath,
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
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      }
    })
  ],
  base: basePath,
})
